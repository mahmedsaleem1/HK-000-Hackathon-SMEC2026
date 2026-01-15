"""
SROIE Dataset Batch Testing Script - IMPROVED VERSION
Tests OCR accuracy on SROIE dataset with image preprocessing
Generates accuracy report and comparison with ground truth
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from datetime import datetime
import csv

# Add parent directory to path to import from utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from PIL import Image, ImageEnhance, ImageFilter
    import pytesseract
    import numpy as np
except ImportError:
    print("❌ Missing dependencies. Install with:")
    print("   pip install pillow pytesseract numpy")
    sys.exit(1)

class SROIETester:
    def __init__(self, images_dir, ground_truth_dir, results_dir):
        self.images_dir = Path(images_dir)
        self.ground_truth_dir = Path(ground_truth_dir)
        self.results_dir = Path(results_dir)
        self.results_dir.mkdir(parents=True, exist_ok=True)
        
        self.results = []
        self.accuracy_metrics = {
            'total_processed': 0,
            'successful_extractions': 0,
            'vendor_matches': 0,
            'amount_matches': 0,
            'date_matches': 0,
            'total_processing_time': 0
        }
    
    def preprocess_image(self, image):
        """Preprocess image to improve OCR accuracy"""
        # Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(2.0)
        
        # Denoise
        image = image.filter(ImageFilter.MedianFilter(size=3))
        
        # Binarization (convert to black and white)
        threshold = 128
        image = image.point(lambda x: 0 if x < threshold else 255, '1')
        
        return image
    
    def extract_text_from_image(self, image_path):
        """Extract text from receipt image using Tesseract OCR with preprocessing"""
        try:
            image = Image.open(image_path)
            
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # Try multiple OCR configurations for better results
            configs = [
                r'--oem 3 --psm 6',  # Assume uniform block of text
                r'--oem 3 --psm 4',  # Assume single column of text
                r'--oem 3 --psm 11', # Sparse text
            ]
            
            best_text = ""
            best_confidence = 0
            
            for config in configs:
                try:
                    text = pytesseract.image_to_string(processed_image, config=config)
                    data = pytesseract.image_to_data(processed_image, config=config, output_type=pytesseract.Output.DICT)
                    confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
                    avg_conf = sum(confidences) / len(confidences) if confidences else 0
                    
                    if avg_conf > best_confidence:
                        best_confidence = avg_conf
                        best_text = text
                except:
                    continue
            
            return best_text, best_confidence
        except Exception as e:
            print(f"   ❌ OCR Error: {e}")
            return None, 0
    
    def parse_extracted_data(self, text):
        """Parse vendor, amount, date from OCR text with improved patterns"""
        import re
        
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        data = {
            'vendor': None,
            'amount': None,
            'date': None
        }
        
        # Extract vendor (first non-empty substantial line)
        vendor_keywords = ['SDN', 'BHD', 'PTY', 'LTD', 'CO', 'ENTERPRISE', 'TRADING', 'COMPANY']
        for line in lines[:5]:  # Check first 5 lines
            # Skip lines that are mostly numbers or symbols
            if len(line) > 5 and not re.match(r'^[\d\W]+$', line):
                data['vendor'] = line.upper()
                # Prefer lines with company indicators
                if any(keyword in line.upper() for keyword in vendor_keywords):
                    break
        
        # If still no vendor, use first line
        if not data['vendor'] and lines:
            data['vendor'] = lines[0].upper()
        
        # Extract amount (look for currency patterns with more variants)
        amount_patterns = [
            r'TOTAL[:\s]*(?:RM|MYR|\$|USD)?\s*(\d+\.\d{2})',
            r'(?:RM|MYR|\$|USD)\s*(\d+\.\d{2})',
            r'AMOUNT[:\s]*(?:RM|MYR|\$|USD)?\s*(\d+\.\d{2})',
            r'CASH[:\s]*(?:RM|MYR|\$|USD)?\s*(\d+\.\d{2})',
            r'(?:^|\s)(\d+\.\d{2})(?:\s|$)',  # Any number with 2 decimals
        ]
        
        # Find all potential amounts
        amounts = []
        for pattern in amount_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                try:
                    amount = float(match.group(1))
                    # Filter unrealistic amounts
                    if 0.01 <= amount <= 99999.99:
                        amounts.append(match.group(1))
                except:
                    continue
        
        # Use the last amount found (usually the total)
        if amounts:
            data['amount'] = amounts[-1]
        
        # Extract date (various formats)
        date_patterns = [
            r'(\d{2}/\d{2}/\d{4})',          # DD/MM/YYYY
            r'(\d{2}-\d{2}-\d{4})',          # DD-MM-YYYY
            r'(\d{4}-\d{2}-\d{2})',          # YYYY-MM-DD
            r'(\d{2}/\d{2}/\d{2})',          # DD/MM/YY
            r'(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{4})',  # DD MON YYYY
        ]
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_str = match.group(1)
                # Basic validation
                if not re.search(r'(00[/-]00|99[/-]99)', date_str):
                    data['date'] = date_str
                    break
        
        return data
    
    def load_ground_truth(self, filename):
        """Load ground truth data from .txt file"""
        base_name = Path(filename).stem
        gt_file = self.ground_truth_dir / f"{base_name}.txt"
        
        if not gt_file.exists():
            return None
        
        try:
            with open(gt_file, 'r', encoding='utf-8') as f:
                gt_data = json.load(f)
            return {
                'vendor': gt_data.get('company', '').upper(),
                'amount': gt_data.get('total', ''),
                'date': gt_data.get('date', '')
            }
        except Exception as e:
            print(f"   ⚠️  Could not load ground truth: {e}")
            return None
    
    def compare_with_ground_truth(self, extracted, ground_truth):
        """Compare extracted data with ground truth"""
        if not ground_truth:
            return {'vendor': False, 'amount': False, 'date': False}
        
        matches = {
            'vendor': self.fuzzy_match(extracted['vendor'], ground_truth['vendor']),
            'amount': extracted['amount'] == ground_truth['amount'],
            'date': self.date_match(extracted['date'], ground_truth['date'])
        }
        
        return matches
    
    def fuzzy_match(self, text1, text2, threshold=0.7):
        """Fuzzy string matching for vendor names"""
        if not text1 or not text2:
            return False
        
        # Simple similarity: count matching words
        words1 = set(text1.upper().split())
        words2 = set(text2.upper().split())
        
        if not words1 or not words2:
            return False
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        similarity = intersection / union if union > 0 else 0
        return similarity >= threshold
    
    def date_match(self, date1, date2):
        """Check if dates match (handling different formats)"""
        if not date1 or not date2:
            return False
        
        # Remove separators and compare
        clean1 = date1.replace('/', '').replace('-', '')
        clean2 = date2.replace('/', '').replace('-', '')
        
        return clean1 == clean2
    
    def process_image(self, image_path):
        """Process single receipt image"""
        filename = image_path.name
        print(f"\n📄 Processing: {filename}")
        
        start_time = time.time()
        
        # Extract text
        text, confidence = self.extract_text_from_image(image_path)
        if not text:
            return None
        
        # Parse data
        extracted = self.parse_extracted_data(text)
        
        # Load ground truth
        ground_truth = self.load_ground_truth(filename)
        
        # Compare
        matches = self.compare_with_ground_truth(extracted, ground_truth)
        
        processing_time = time.time() - start_time
        
        result = {
            'filename': filename,
            'extracted_vendor': extracted['vendor'],
            'extracted_amount': extracted['amount'],
            'extracted_date': extracted['date'],
            'gt_vendor': ground_truth['vendor'] if ground_truth else None,
            'gt_amount': ground_truth['amount'] if ground_truth else None,
            'gt_date': ground_truth['date'] if ground_truth else None,
            'vendor_match': matches['vendor'],
            'amount_match': matches['amount'],
            'date_match': matches['date'],
            'confidence': round(confidence, 2),
            'processing_time': round(processing_time, 2)
        }
        
        # Update metrics
        self.accuracy_metrics['total_processed'] += 1
        if any([matches['vendor'], matches['amount'], matches['date']]):
            self.accuracy_metrics['successful_extractions'] += 1
        if matches['vendor']:
            self.accuracy_metrics['vendor_matches'] += 1
        if matches['amount']:
            self.accuracy_metrics['amount_matches'] += 1
        if matches['date']:
            self.accuracy_metrics['date_matches'] += 1
        self.accuracy_metrics['total_processing_time'] += processing_time
        
        # Print result
        print(f"   Vendor: {'✅' if matches['vendor'] else '❌'} {extracted['vendor']}")
        print(f"   Amount: {'✅' if matches['amount'] else '❌'} {extracted['amount']}")
        print(f"   Date:   {'✅' if matches['date'] else '❌'} {extracted['date']}")
        print(f"   Confidence: {confidence:.1f}%")
        print(f"   Time: {processing_time:.2f}s")
        
        return result
    
    def process_batch(self, limit=None, offset=0):
        """Process batch of images"""
        image_files = sorted(list(self.images_dir.glob('*.jpg')))
        
        if offset > 0:
            image_files = image_files[offset:]
        
        if limit:
            image_files = image_files[:limit]
        
        print(f"\n🚀 Starting SROIE Batch Testing (IMPROVED)")
        print(f"📁 Images Directory: {self.images_dir}")
        print(f"📊 Processing {len(image_files)} images")
        print(f"⏱️  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        for i, image_path in enumerate(image_files, 1):
            print(f"\n[{i}/{len(image_files)}] ", end='')
            result = self.process_image(image_path)
            if result:
                self.results.append(result)
        
        print("\n\n✅ Batch processing complete!")
    
    def save_results(self):
        """Save results to CSV and JSON"""
        # Save CSV
        csv_path = self.results_dir / 'sroie_test_results.csv'
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            if self.results:
                writer = csv.DictWriter(f, fieldnames=self.results[0].keys())
                writer.writeheader()
                writer.writerows(self.results)
        print(f"\n💾 Results saved: {csv_path}")
        
        # Calculate percentages
        total = self.accuracy_metrics['total_processed']
        if total > 0:
            accuracy_report = {
                'summary': {
                    'total_images_processed': total,
                    'successful_extractions': self.accuracy_metrics['successful_extractions'],
                    'success_rate': round(self.accuracy_metrics['successful_extractions'] / total * 100, 2)
                },
                'field_accuracy': {
                    'vendor_accuracy': round(self.accuracy_metrics['vendor_matches'] / total * 100, 2),
                    'amount_accuracy': round(self.accuracy_metrics['amount_matches'] / total * 100, 2),
                    'date_accuracy': round(self.accuracy_metrics['date_matches'] / total * 100, 2)
                },
                'performance': {
                    'total_processing_time': round(self.accuracy_metrics['total_processing_time'], 2),
                    'average_time_per_image': round(self.accuracy_metrics['total_processing_time'] / total, 2)
                },
                'timestamp': datetime.now().isoformat()
            }
        else:
            accuracy_report = {'error': 'No images processed'}
        
        # Save JSON report
        json_path = self.results_dir / 'sroie_accuracy_report.json'
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(accuracy_report, f, indent=2)
        print(f"📊 Accuracy report: {json_path}")
        
        # Generate text report
        self.generate_text_report(accuracy_report)
    
    def generate_text_report(self, accuracy_report):
        """Generate human-readable text report"""
        report_path = self.results_dir / 'sroie_detailed_report.txt'
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("SROIE DATASET OCR TESTING REPORT (IMPROVED)\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Dataset: SROIE (Scanned Receipts OCR and Information Extraction)\n")
            f.write(f"Improvements: Image preprocessing, multiple OCR passes, better parsing\n\n")
            
            if 'error' not in accuracy_report:
                summary = accuracy_report['summary']
                field_acc = accuracy_report['field_accuracy']
                perf = accuracy_report['performance']
                
                f.write("SUMMARY\n")
                f.write("-" * 60 + "\n")
                f.write(f"Total Images Processed: {summary['total_images_processed']}\n")
                f.write(f"Successful Extractions: {summary['successful_extractions']}\n")
                f.write(f"Success Rate: {summary['success_rate']}%\n\n")
                
                f.write("FIELD-LEVEL ACCURACY\n")
                f.write("-" * 60 + "\n")
                f.write(f"Vendor Name Accuracy: {field_acc['vendor_accuracy']}%\n")
                f.write(f"Total Amount Accuracy: {field_acc['amount_accuracy']}%\n")
                f.write(f"Date Accuracy: {field_acc['date_accuracy']}%\n\n")
                
                f.write("PERFORMANCE METRICS\n")
                f.write("-" * 60 + "\n")
                f.write(f"Total Processing Time: {perf['total_processing_time']}s\n")
                f.write(f"Average Time per Image: {perf['average_time_per_image']}s\n\n")
                
                f.write("=" * 60 + "\n")
        
        print(f"📝 Detailed report: {report_path}")

def main():
    parser = argparse.ArgumentParser(description='SROIE Dataset Batch Testing (IMPROVED)')
    parser.add_argument('--images', default='../../../SROIE2019/train/img', help='Images directory')
    parser.add_argument('--ground-truth', default='../../../SROIE2019/train/entities', help='Ground truth directory')
    parser.add_argument('--results', default='../../../SROIE_Dataset/results', help='Results output directory')
    parser.add_argument('--limit', type=int, help='Limit number of images to process')
    parser.add_argument('--offset', type=int, default=0, help='Start from image number')
    parser.add_argument('--sample', type=int, help='Quick sample testing (equivalent to --limit)')
    parser.add_argument('--full', action='store_true', help='Process all images')
    
    args = parser.parse_args()
    
    # Handle sample flag
    if args.sample:
        args.limit = args.sample
    
    # Check if images directory exists
    if not Path(args.images).exists():
        print(f"❌ Images directory not found: {args.images}")
        print("\n📥 Please download SROIE dataset first:")
        print("   https://www.kaggle.com/datasets/urbikn/sroie-datasetv2/data")
        sys.exit(1)
    
    # Create tester
    tester = SROIETester(args.images, args.ground_truth, args.results)
    
    # Process batch
    tester.process_batch(limit=args.limit, offset=args.offset)
    
    # Save results
    tester.save_results()
    
    print("\n✅ SROIE testing complete!")
    print(f"📁 Check results in: {args.results}")

if __name__ == '__main__':
    main()
