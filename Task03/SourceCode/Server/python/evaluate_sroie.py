"""
SROIE Dataset Evaluation Script with Improved Metrics

This script evaluates OCR accuracy using:
1. Exact match (strict)
2. Fuzzy match (normalized similarity)
3. Extraction rate (did we get something?)
4. Error categorization

Usage:
    python evaluate_sroie.py [--improved] [--limit N]
    
    --improved: Use improved OCR and field extractor
    --limit N:  Process only first N images
"""

import os
import sys
import json
import re
import csv
import time
import argparse
from datetime import datetime
from difflib import SequenceMatcher


class AccuracyMetrics:
    """
    Comprehensive accuracy measurement with multiple metrics
    """
    
    @staticmethod
    def normalize_text(text):
        """Normalize text for comparison"""
        if not text:
            return ""
        text = str(text).upper()
        text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
        text = ' '.join(text.split())  # Collapse whitespace
        return text
    
    @staticmethod
    def exact_match(extracted, ground_truth):
        """Strict exact match"""
        if not extracted or not ground_truth:
            return False
        return str(extracted).strip().upper() == str(ground_truth).strip().upper()
    
    @staticmethod
    def fuzzy_match(extracted, ground_truth, threshold=0.75):
        """
        Fuzzy match using normalized similarity
        Threshold of 0.75 allows for minor OCR errors
        """
        if not extracted or not ground_truth:
            return False, 0.0
        
        ext_norm = AccuracyMetrics.normalize_text(extracted)
        gt_norm = AccuracyMetrics.normalize_text(ground_truth)
        
        if not ext_norm or not gt_norm:
            return False, 0.0
        
        similarity = SequenceMatcher(None, ext_norm, gt_norm).ratio()
        return similarity >= threshold, similarity
    
    @staticmethod
    def normalize_date(date_str):
        """
        Normalize date to YYYY-MM-DD for comparison
        Handles multiple formats
        """
        if not date_str:
            return None
        
        date_str = str(date_str).strip()
        
        # List of possible formats
        formats = [
            '%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y',  # DD/MM/YYYY
            '%Y-%m-%d', '%Y/%m/%d',              # ISO
            '%Y%m%d',                             # No separator
            '%d/%m/%y', '%d-%m-%y',              # Short year
            '%d %b %Y', '%d %B %Y',              # Written month
        ]
        
        for fmt in formats:
            try:
                parsed = datetime.strptime(date_str, fmt)
                return parsed.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        return None
    
    @staticmethod
    def date_match(extracted, ground_truth):
        """
        Match dates regardless of format differences
        Returns: (is_match, normalized_extracted, normalized_gt)
        """
        ext_norm = AccuracyMetrics.normalize_date(extracted)
        gt_norm = AccuracyMetrics.normalize_date(ground_truth)
        
        if ext_norm and gt_norm:
            return ext_norm == gt_norm, ext_norm, gt_norm
        return False, ext_norm, gt_norm
    
    @staticmethod
    def normalize_amount(amount):
        """Normalize amount to float"""
        if amount is None:
            return None
        
        if isinstance(amount, (int, float)):
            return float(amount)
        
        # Remove currency symbols and parse
        amount_str = str(amount)
        amount_str = re.sub(r'[^\d.]', '', amount_str)
        
        try:
            return float(amount_str)
        except ValueError:
            return None
    
    @staticmethod
    def amount_match(extracted, ground_truth, tolerance=0.01):
        """
        Match amounts with small tolerance for floating point
        """
        ext_norm = AccuracyMetrics.normalize_amount(extracted)
        gt_norm = AccuracyMetrics.normalize_amount(ground_truth)
        
        if ext_norm is not None and gt_norm is not None:
            return abs(ext_norm - gt_norm) <= tolerance, ext_norm, gt_norm
        return False, ext_norm, gt_norm


class ErrorAnalyzer:
    """
    Categorize and analyze extraction errors
    """
    
    ERROR_CATEGORIES = {
        'correct': 'Correct extraction',
        'ocr_garbage': 'OCR produced garbage characters',
        'wrong_field': 'Extracted wrong field (e.g., cashier name instead of vendor)',
        'format_mismatch': 'Correct value but wrong format',
        'partial_match': 'Partially correct extraction',
        'not_extracted': 'Could not extract any value',
        'wrong_value': 'Extracted a value but it was wrong'
    }
    
    @staticmethod
    def categorize_vendor_error(extracted, ground_truth):
        """Categorize vendor extraction error"""
        if not extracted:
            return 'not_extracted'
        
        ext_upper = str(extracted).upper()
        gt_upper = str(ground_truth).upper()
        
        # Check for garbage characters
        garbage_ratio = sum(1 for c in ext_upper if not c.isalnum() and c not in ' .,&\'-') / max(len(ext_upper), 1)
        if garbage_ratio > 0.3:
            return 'ocr_garbage'
        
        # Check for partial match
        _, similarity = AccuracyMetrics.fuzzy_match(extracted, ground_truth)
        if similarity >= 0.5:
            return 'partial_match'
        
        # Check for common wrong fields (cashier names are typically short)
        if len(ext_upper.split()) <= 2 and len(gt_upper.split()) > 3:
            return 'wrong_field'
        
        return 'wrong_value'
    
    @staticmethod
    def categorize_amount_error(extracted, ground_truth):
        """Categorize amount extraction error"""
        if extracted is None:
            return 'not_extracted'
        
        ext_val = AccuracyMetrics.normalize_amount(extracted)
        gt_val = AccuracyMetrics.normalize_amount(ground_truth)
        
        if ext_val is None:
            return 'ocr_garbage'
        
        if gt_val is None:
            return 'format_mismatch'
        
        # Check if we got a related value (could be subtotal, item price, etc.)
        if 0.8 <= ext_val / max(gt_val, 0.01) <= 1.2:
            return 'partial_match'
        
        return 'wrong_value'
    
    @staticmethod
    def categorize_date_error(extracted, ground_truth):
        """Categorize date extraction error"""
        if not extracted:
            return 'not_extracted'
        
        ext_norm = AccuracyMetrics.normalize_date(extracted)
        gt_norm = AccuracyMetrics.normalize_date(ground_truth)
        
        if ext_norm is None:
            return 'format_mismatch'
        
        if gt_norm is None:
            return 'format_mismatch'
        
        # Check if year matches (partial extraction)
        if ext_norm and gt_norm and ext_norm[:4] == gt_norm[:4]:
            return 'partial_match'
        
        return 'wrong_value'


def load_ground_truth(gt_path):
    """Load ground truth JSON file"""
    with open(gt_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Handle potential BOM or encoding issues
        content = content.strip()
        if content.startswith('\ufeff'):
            content = content[1:]
        return json.loads(content)


def process_image(image_path, use_improved=False):
    """
    Process a single image through OCR and field extraction
    
    Args:
        image_path: Path to image file
        use_improved: Use improved processors
    
    Returns: Extraction result dict
    """
    import subprocess
    
    # Select processor scripts
    if use_improved:
        ocr_script = os.path.join(os.path.dirname(__file__), 'ocr_processor_improved.py')
        extractor_script = os.path.join(os.path.dirname(__file__), 'field_extractor_improved.py')
    else:
        ocr_script = os.path.join(os.path.dirname(__file__), 'ocr_processor.py')
        extractor_script = os.path.join(os.path.dirname(__file__), 'field_extractor.py')
    
    start_time = time.time()
    
    try:
        # Step 1: OCR
        ocr_result = subprocess.run(
            ['python', ocr_script, image_path],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if ocr_result.returncode != 0:
            return {
                'success': False,
                'error': f'OCR failed: {ocr_result.stderr}',
                'processing_time': time.time() - start_time
            }
        
        ocr_data = json.loads(ocr_result.stdout)
        
        if not ocr_data.get('success'):
            return {
                'success': False,
                'error': ocr_data.get('error', 'OCR failed'),
                'processing_time': time.time() - start_time
            }
        
        raw_text = ocr_data.get('raw_text', '')
        
        # Step 2: Field extraction
        extract_result = subprocess.run(
            ['python', extractor_script],
            input=raw_text,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if extract_result.returncode != 0:
            return {
                'success': False,
                'error': f'Extraction failed: {extract_result.stderr}',
                'raw_text': raw_text,
                'processing_time': time.time() - start_time
            }
        
        extract_data = json.loads(extract_result.stdout)
        
        return {
            'success': True,
            'raw_text': raw_text,
            'fields': extract_data.get('extracted_fields', {}),
            'processing_time': time.time() - start_time
        }
        
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Processing timeout',
            'processing_time': time.time() - start_time
        }
    except json.JSONDecodeError as e:
        return {
            'success': False,
            'error': f'JSON parse error: {str(e)}',
            'processing_time': time.time() - start_time
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'processing_time': time.time() - start_time
        }


def run_evaluation(images_dir, gt_dir, output_dir, use_improved=False, limit=None):
    """
    Run full evaluation on SROIE dataset
    
    Args:
        images_dir: Directory containing receipt images
        gt_dir: Directory containing ground truth JSON files
        output_dir: Directory for output reports
        use_improved: Use improved processors
        limit: Maximum images to process
    """
    print(f"=" * 60)
    print(f"SROIE Dataset Evaluation")
    print(f"Using {'IMPROVED' if use_improved else 'ORIGINAL'} processors")
    print(f"=" * 60)
    
    # Find matching image/ground-truth pairs
    gt_files = [f for f in os.listdir(gt_dir) if f.endswith('.txt')]
    
    # Limit if specified
    if limit:
        gt_files = gt_files[:limit]
    
    print(f"Found {len(gt_files)} ground truth files")
    
    # Results storage
    results = []
    
    # Counters for accuracy
    counts = {
        'total': 0,
        'processed': 0,
        'date_exact': 0,
        'date_fuzzy': 0,
        'amount_exact': 0,
        'amount_fuzzy': 0,
        'vendor_exact': 0,
        'vendor_fuzzy': 0,
        'date_extracted': 0,
        'amount_extracted': 0,
        'vendor_extracted': 0
    }
    
    # Error categorization
    errors = {
        'date': {},
        'amount': {},
        'vendor': {}
    }
    
    for i, gt_file in enumerate(gt_files):
        image_name = gt_file.replace('.txt', '.jpg')
        image_path = os.path.join(images_dir, image_name)
        gt_path = os.path.join(gt_dir, gt_file)
        
        if not os.path.exists(image_path):
            # Try .png
            image_path = os.path.join(images_dir, gt_file.replace('.txt', '.png'))
            if not os.path.exists(image_path):
                print(f"  [{i+1}/{len(gt_files)}] Image not found: {image_name}")
                continue
        
        counts['total'] += 1
        
        # Load ground truth
        try:
            gt = load_ground_truth(gt_path)
        except Exception as e:
            print(f"  [{i+1}/{len(gt_files)}] GT load error: {e}")
            continue
        
        # Process image
        print(f"  [{i+1}/{len(gt_files)}] Processing {image_name}...", end=" ")
        result = process_image(image_path, use_improved)
        
        if not result['success']:
            print(f"FAILED: {result.get('error', 'Unknown error')[:50]}")
            continue
        
        counts['processed'] += 1
        fields = result['fields']
        
        # Extract values
        ext_date = fields.get('date')
        ext_amount = fields.get('amount')
        ext_vendor = fields.get('vendor')
        
        gt_date = gt.get('date')
        gt_amount = gt.get('total')
        gt_vendor = gt.get('company')
        
        # Measure accuracy
        
        # Date
        if ext_date:
            counts['date_extracted'] += 1
        date_exact, _, _ = AccuracyMetrics.date_match(ext_date, gt_date)
        if date_exact:
            counts['date_exact'] += 1
            counts['date_fuzzy'] += 1
        else:
            error_cat = ErrorAnalyzer.categorize_date_error(ext_date, gt_date)
            errors['date'][error_cat] = errors['date'].get(error_cat, 0) + 1
        
        # Amount
        if ext_amount is not None:
            counts['amount_extracted'] += 1
        amount_exact, _, _ = AccuracyMetrics.amount_match(ext_amount, gt_amount)
        if amount_exact:
            counts['amount_exact'] += 1
            counts['amount_fuzzy'] += 1
        else:
            error_cat = ErrorAnalyzer.categorize_amount_error(ext_amount, gt_amount)
            errors['amount'][error_cat] = errors['amount'].get(error_cat, 0) + 1
        
        # Vendor
        if ext_vendor:
            counts['vendor_extracted'] += 1
        vendor_exact = AccuracyMetrics.exact_match(ext_vendor, gt_vendor)
        vendor_fuzzy, vendor_sim = AccuracyMetrics.fuzzy_match(ext_vendor, gt_vendor, threshold=0.7)
        
        if vendor_exact:
            counts['vendor_exact'] += 1
        if vendor_fuzzy:
            counts['vendor_fuzzy'] += 1
        else:
            error_cat = ErrorAnalyzer.categorize_vendor_error(ext_vendor, gt_vendor)
            errors['vendor'][error_cat] = errors['vendor'].get(error_cat, 0) + 1
        
        # Store result
        results.append({
            'filename': image_name,
            'extracted_vendor': ext_vendor,
            'extracted_amount': ext_amount,
            'extracted_date': ext_date,
            'gt_vendor': gt_vendor,
            'gt_amount': gt_amount,
            'gt_date': gt_date,
            'vendor_exact': vendor_exact,
            'vendor_fuzzy': vendor_fuzzy,
            'vendor_similarity': vendor_sim if ext_vendor else 0,
            'amount_exact': amount_exact,
            'date_exact': date_exact,
            'confidence': fields.get('overall_confidence', 0),
            'processing_time': result['processing_time']
        })
        
        status = 'OK' if (date_exact or amount_exact or vendor_exact) else 'MISS'
        print(f"{status} (time: {result['processing_time']:.2f}s)")
    
    # Calculate final metrics
    n = max(counts['processed'], 1)
    
    metrics = {
        'summary': {
            'total_images': counts['total'],
            'processed_successfully': counts['processed'],
            'success_rate': round(counts['processed'] / max(counts['total'], 1) * 100, 2)
        },
        'exact_match_accuracy': {
            'date': round(counts['date_exact'] / n * 100, 2),
            'amount': round(counts['amount_exact'] / n * 100, 2),
            'vendor': round(counts['vendor_exact'] / n * 100, 2)
        },
        'fuzzy_match_accuracy': {
            'date': round(counts['date_fuzzy'] / n * 100, 2) if 'date_fuzzy' in counts else None,
            'amount': round(counts['amount_fuzzy'] / n * 100, 2) if 'amount_fuzzy' in counts else None,
            'vendor': round(counts['vendor_fuzzy'] / n * 100, 2)
        },
        'extraction_rate': {
            'date': round(counts['date_extracted'] / n * 100, 2),
            'amount': round(counts['amount_extracted'] / n * 100, 2),
            'vendor': round(counts['vendor_extracted'] / n * 100, 2)
        },
        'error_analysis': errors,
        'processor_type': 'improved' if use_improved else 'original',
        'timestamp': datetime.now().isoformat()
    }
    
    # Save reports
    os.makedirs(output_dir, exist_ok=True)
    
    # JSON report
    report_name = 'evaluation_improved.json' if use_improved else 'evaluation_original.json'
    with open(os.path.join(output_dir, report_name), 'w') as f:
        json.dump(metrics, f, indent=2)
    
    # CSV results
    csv_name = 'results_improved.csv' if use_improved else 'results_original.csv'
    with open(os.path.join(output_dir, csv_name), 'w', newline='', encoding='utf-8') as f:
        if results:
            writer = csv.DictWriter(f, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
    
    # Print summary
    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    print(f"\nProcessed: {counts['processed']}/{counts['total']} images")
    print(f"\nEXACT MATCH ACCURACY:")
    print(f"  Date:   {metrics['exact_match_accuracy']['date']}%")
    print(f"  Amount: {metrics['exact_match_accuracy']['amount']}%")
    print(f"  Vendor: {metrics['exact_match_accuracy']['vendor']}%")
    print(f"\nFUZZY MATCH ACCURACY (vendor @ 70% threshold):")
    print(f"  Vendor: {metrics['fuzzy_match_accuracy']['vendor']}%")
    print(f"\nEXTRACTION RATE (got something vs nothing):")
    print(f"  Date:   {metrics['extraction_rate']['date']}%")
    print(f"  Amount: {metrics['extraction_rate']['amount']}%")
    print(f"  Vendor: {metrics['extraction_rate']['vendor']}%")
    print(f"\nError Analysis:")
    for field, errs in errors.items():
        if errs:
            print(f"  {field.upper()}:")
            for cat, count in sorted(errs.items(), key=lambda x: -x[1]):
                print(f"    {cat}: {count}")
    print("\n" + "=" * 60)
    print(f"Reports saved to: {output_dir}")
    
    return metrics


def main():
    parser = argparse.ArgumentParser(description='Evaluate OCR accuracy on SROIE dataset')
    parser.add_argument('--improved', action='store_true', 
                       help='Use improved OCR and field extractor')
    parser.add_argument('--limit', type=int, default=None,
                       help='Limit number of images to process')
    parser.add_argument('--images', type=str, default=None,
                       help='Path to images directory')
    parser.add_argument('--gt', type=str, default=None,
                       help='Path to ground truth directory')
    parser.add_argument('--output', type=str, default=None,
                       help='Path to output directory')
    
    args = parser.parse_args()
    
    # Default paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(os.path.dirname(script_dir))  # Task03 folder
    
    images_dir = args.images or os.path.join(base_dir, 'SROIE_Dataset', 'images')
    gt_dir = args.gt or os.path.join(base_dir, 'SROIE_Dataset', 'ground_truth')
    output_dir = args.output or os.path.join(base_dir, 'SROIE_Dataset', 'results_improved' if args.improved else 'results')
    
    # Verify directories exist
    if not os.path.exists(images_dir):
        print(f"Error: Images directory not found: {images_dir}")
        sys.exit(1)
    
    if not os.path.exists(gt_dir):
        print(f"Error: Ground truth directory not found: {gt_dir}")
        sys.exit(1)
    
    # Run evaluation
    run_evaluation(
        images_dir=images_dir,
        gt_dir=gt_dir,
        output_dir=output_dir,
        use_improved=args.improved,
        limit=args.limit
    )


if __name__ == "__main__":
    main()
