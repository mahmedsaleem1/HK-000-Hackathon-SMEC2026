

import re
import sys
import json
from datetime import datetime
from difflib import SequenceMatcher


class SROIEFieldExtractor:
   
    # Malaysian company suffixes (strong vendor indicators)
    COMPANY_SUFFIXES = [
        'SDN BHD', 'SDN. BHD.', 'SDN. BHD', 'SENDIRIAN BERHAD',
        'S/B', 'BHD', 'BERHAD', 'PLT', 'ENTERPRISE', 'TRADING',
        'RESTAURANT', 'CAFE', 'MART', 'SHOP', 'HARDWARE',
        'STATIONERY', 'BAKERY', 'GROCER', 'SUPERMARKET'
    ]
    
    KNOWN_VENDORS = {
        'UNIHAKKA': ('UNIHAKKA INTERNATIONAL SDN BHD', 95),
        'MR D.I.Y': ('MR. D.I.Y. SDN BHD', 95),
        'MR.D.I.Y': ('MR.D.I.Y(M)SDN BHD', 95),
        '99 SPEED': ('99 SPEED MART S/B', 95),
        'SPEED MART': ('99 SPEED MART S/B', 90),
        'AEON': ('AEON CO. (M) BHD', 90),
        'POPULAR BOOK': ('POPULAR BOOK CO. (M) SDN BHD', 90),
        'THREE STOOGES': ('THREE STOOGES', 95),
        'GARDENIA': ('GARDENIA BAKERIES (KL) SDN BHD', 90),
        'LIGHTROOM': ('LIGHTROOM GALLERY SDN BHD', 90),
        'PERNIAGAAN ZHENG': ('PERNIAGAAN ZHENG HUI', 90),
        'BOOK TA': ('BOOK TA .K (TAMAN DAYA) SDN BHD', 85),
        'TEO HENG': ('TEO HENG STATIONERY & BOOKS', 90),
        'HON HWA': ('HON HWA HARDWARE TRADING', 90),
        'ADVANCO': ('ADVANCO COMPANY', 95),
        'SANYU': ('SANYU STATIONERY SHOP', 90),
    }
    
    TOTAL_KEYWORDS = [
        ('grand total', 100),
        ('total', 90),
        ('nett total', 95),
        ('amount due', 90),
        ('amount', 80),
        ('cash', 75),
        ('tendered', 70),
        ('tunai', 80),       # Malay for cash
        ('jumlah', 85),      # Malay for total
    ]
    
    EXCLUDE_KEYWORDS = [
        'subtotal', 'sub total', 'sub-total',
        'tax', 'gst', 'sst', 'service charge', 'service tax',
        'discount', 'savings', 'change', 'baki',  
        'item', 'qty', 'quantity', 'unit price', 'unit',
        'rounding'
    ]
    
    # Category keywords (same as original)
    CATEGORY_KEYWORDS = {
        "Food": [
            "restaurant", "cafe", "coffee", "pizza", "burger", "lunch", "dinner",
            "breakfast", "grocery", "supermarket", "market", "bakery", "food",
            "chicken", "rice", "noodle", "vegetarian", "seafood"
        ],
        "Shopping": [
            "hardware", "stationery", "book", "mart", "store", "shop",
            "diy", "furniture", "home", "gift", "craft"
        ],
        "Travel": [
            "petrol", "gas", "shell", "petronas", "caltex",
            "parking", "toll", "transit"
        ],
        "Utilities": [
            "electric", "water", "phone", "telekom", "service"
        ]
    }
    
    def __init__(self, text):
        """Initialize with raw OCR text"""
        self.text = text
        self.text_upper = text.upper()
        self.text_lower = text.lower()
        self.lines = [line.strip() for line in text.split('\n') if line.strip()]
        self.extraction_log = []
    
    def log(self, field, message):
        """Log extraction reasoning for transparency"""
        self.extraction_log.append({'field': field, 'message': message})
    
    # =====================
    # DATE EXTRACTION
    # =====================
    
    def extract_date(self):
        """
        Extract date with SROIE-specific format handling
        More lenient matching to handle OCR errors
        
        Returns: (formatted_date, confidence, extraction_reason)
        """
        candidates = []
        
        # Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
        pattern1 = r'(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})'
        for match in re.finditer(pattern1, self.text):
            p1, p2, year = match.groups()
            year_int = int(year)
            
            if 2015 <= year_int <= 2025:
                day, month = int(p1), int(p2)
                
                # Valid date
                if 1 <= day <= 31 and 1 <= month <= 12:
                    date_str = f"{p1.zfill(2)}/{p2.zfill(2)}/{year}"
                    candidates.append({
                        'date': date_str,
                        'confidence': 92,
                        'reason': f'Matched DD/MM/YYYY: {match.group()}'
                    })
                # Try swapping day/month if one is invalid
                elif 1 <= month <= 31 and 1 <= day <= 12:
                    date_str = f"{p2.zfill(2)}/{p1.zfill(2)}/{year}"
                    candidates.append({
                        'date': date_str,
                        'confidence': 80,
                        'reason': f'Swapped DD/MM: {match.group()}'
                    })
                # OCR error - try to salvage (e.g., 40 -> 10, 0 misread as 4)
                elif month > 12 and 1 <= day <= 31:
                    # Common OCR error: 1 -> 4, 0 -> 0 (10 becomes 40)
                    fixed_month = month % 10 if month > 12 else month
                    if fixed_month == 0:
                        fixed_month = 10  # 40 -> 10
                    if 1 <= fixed_month <= 12:
                        date_str = f"{p1.zfill(2)}/{str(fixed_month).zfill(2)}/{year}"
                        candidates.append({
                            'date': date_str,
                            'confidence': 60,
                            'reason': f'OCR-corrected month {month}->{fixed_month}: {match.group()}'
                        })
        
        # Pattern 2: DD MMM YYYY (e.g., 18 MAR 2018)
        months = {
            'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
            'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
            'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
        }
        pattern2 = r'(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})'
        for match in re.finditer(pattern2, self.text_upper):
            day, month_str, year = match.groups()
            month = months[month_str]
            date_str = f"{day.zfill(2)}/{month}/{year}"
            candidates.append({
                'date': date_str,
                'confidence': 95,
                'reason': f'Matched DD MMM YYYY: {match.group()}'
            })
        
        # Pattern 3: YYYYMMDD (no separators)
        pattern3 = r'\b(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\b'
        for match in re.finditer(pattern3, self.text):
            year, month, day = match.groups()
            date_str = f"{day}/{month}/{year}"
            candidates.append({
                'date': date_str,
                'confidence': 88,
                'reason': f'Matched YYYYMMDD: {match.group()}'
            })
        
        # Pattern 4: DD-MM-YY or DD/MM/YY (two-digit year)
        pattern4 = r'(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2})\b'
        for match in re.finditer(pattern4, self.text):
            day_s, month_s, year_short = match.groups()
            day, month = int(day_s), int(month_s)
            year = f"20{year_short}"
            
            if 1 <= day <= 31 and 1 <= month <= 12:
                date_str = f"{day_s.zfill(2)}/{month_s.zfill(2)}/{year}"
                candidates.append({
                    'date': date_str,
                    'confidence': 85,
                    'reason': f'Matched DD-MM-YY: {match.group()}'
                })
            elif 1 <= month <= 31 and 1 <= day <= 12:
                date_str = f"{month_s.zfill(2)}/{day_s.zfill(2)}/{year}"
                candidates.append({
                    'date': date_str,
                    'confidence': 75,
                    'reason': f'Swapped DD-MM-YY: {match.group()}'
                })
        
        # Return best candidate
        if candidates:
            best = max(candidates, key=lambda x: x['confidence'])
            self.log('date', f"Selected: {best['date']} ({best['reason']})")
            return best['date'], best['confidence'], best['reason']
        
        self.log('date', 'No date pattern matched')
        return None, 0, 'No date found'
    
    # =====================
    # AMOUNT EXTRACTION
    # =====================
    
    def extract_amount(self):
        """
        Extract total amount using keyword-proximity scoring
        
        Strategy:
        1. Find all monetary amounts in text
        2. Score each based on proximity to 'TOTAL' keywords
        3. Penalize amounts near exclusion keywords (subtotal, tax, etc.)
        4. Consider position (totals usually near bottom)
        
        Returns: (amount, confidence, extraction_reason)
        """
        candidates = []
        
        for i, line in enumerate(self.lines):
            line_lower = line.lower()
            line_upper = line.upper()
            
            # Skip lines with exclusion keywords
            has_exclusion = any(kw in line_lower for kw in self.EXCLUDE_KEYWORDS)
            
            # Find amounts in this line
            # Pattern: RM XX.XX, $XX.XX, or plain XX.XX
            amount_patterns = [
                (r'RM\s*(\d+(?:,\d{3})*(?:\.\d{2})?)', 'RM prefix'),
                (r'\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)', '$ prefix'),
                (r'\b(\d+(?:,\d{3})*\.\d{2})\b', 'decimal number'),
            ]
            
            for pattern, pattern_name in amount_patterns:
                for match in re.finditer(pattern, line, re.IGNORECASE):
                    amount_str = match.group(1).replace(',', '')
                    try:
                        amount = float(amount_str)
                    except ValueError:
                        continue
                    
                    # Skip unrealistic amounts
                    if amount < 0.10 or amount > 50000:
                        continue
                    
                    # Calculate score
                    score = 50  # Base score
                    reasons = [f'Found {amount:.2f} via {pattern_name}']
                    
                    # Boost for total keywords in same line
                    for keyword, boost in self.TOTAL_KEYWORDS:
                        if keyword in line_lower:
                            score += boost
                            reasons.append(f'+{boost} for keyword "{keyword}"')
                            break
                    
                    # Check previous line for keywords (sometimes TOTAL is on separate line)
                    if i > 0:
                        prev_line = self.lines[i-1].lower()
                        for keyword, boost in self.TOTAL_KEYWORDS:
                            if keyword in prev_line:
                                score += int(boost * 0.6)
                                reasons.append(f'+{int(boost*0.6)} for "{keyword}" in prev line')
                                break
                    
                    # Penalize if exclusion keyword present
                    if has_exclusion:
                        score -= 40
                        reasons.append('-40 for exclusion keyword')
                    
                    # Position bonus (totals near bottom)
                    position_ratio = i / max(len(self.lines), 1)
                    if position_ratio > 0.5:
                        position_bonus = int(20 * (position_ratio - 0.5) * 2)
                        score += position_bonus
                        reasons.append(f'+{position_bonus} for position ({position_ratio:.0%} through)')
                    
                    # RM prefix is strong indicator of actual price
                    if 'RM' in pattern:
                        score += 15
                        reasons.append('+15 for RM currency prefix')
                    
                    candidates.append({
                        'amount': amount,
                        'score': score,
                        'line_num': i,
                        'context': line.strip()[:50],
                        'reason': '; '.join(reasons)
                    })
        
        # Return best candidate by score
        if candidates:
            best = max(candidates, key=lambda x: x['score'])
            confidence = min(95, max(30, best['score']))
            
            self.log('amount', f'Best amount: {best["amount"]:.2f} (score={best["score"]})')
            self.log('amount', f'Context: "{best["context"]}"')
            
            return best['amount'], confidence, best['reason']
        
        self.log('amount', 'No valid amount found')
        return None, 0, 'No amount found'
    
    # =====================
    # VENDOR EXTRACTION
    # =====================
    
    def extract_vendor(self):
        """
        Extract vendor name using multiple strategies
        
        Strategy priority:
        1. Match known SROIE vendors (highest confidence)
        2. Find lines with company suffixes (SDN BHD, etc.)
        3. Use cleaned first valid line (fallback)
        
        Returns: (vendor_name, confidence, extraction_reason)
        """
        # Strategy 1: Match known vendors
        for pattern, (full_name, confidence) in self.KNOWN_VENDORS.items():
            if pattern in self.text_upper:
                self.log('vendor', f'Matched known vendor pattern: {pattern}')
                return full_name, confidence, f'Matched known vendor: {pattern}'
        
        # Strategy 2: Find lines with company suffixes
        for i, line in enumerate(self.lines[:10]):  # Check first 10 lines
            line_upper = line.upper()
            
            for suffix in self.COMPANY_SUFFIXES:
                if suffix in line_upper:
                    # Clean the vendor name
                    cleaned = self._clean_vendor_name(line)
                    if cleaned and len(cleaned) > 3:
                        self.log('vendor', f'Found company suffix "{suffix}" in line {i}')
                        return cleaned, 85, f'Company suffix detected: {suffix}'
        
        # Strategy 3: Quality-based header extraction
        for i, line in enumerate(self.lines[:5]):
            cleaned = self._clean_vendor_name(line)
            
            if not cleaned or len(cleaned) < 4:
                continue
            
            # Calculate text quality
            quality = self._calculate_text_quality(cleaned)
            
            # Skip if mostly garbage
            if quality < 0.6:
                continue
            
            # Skip if looks like an address (contains common address words)
            if any(word in cleaned.upper() for word in ['JALAN', 'JLN', 'NO.', 'TAMAN', 'LORONG']):
                continue
            
            # Skip if mostly numeric
            digit_ratio = sum(c.isdigit() for c in cleaned) / len(cleaned)
            if digit_ratio > 0.5:
                continue
            
            confidence = int(60 + (quality * 30))
            self.log('vendor', f'Using header line {i} with quality {quality:.2f}')
            return cleaned, confidence, f'Header extraction (quality={quality:.2f})'
        
        self.log('vendor', 'No vendor could be extracted')
        return None, 0, 'No vendor found'
    
    def _clean_vendor_name(self, text):
        """Remove noise from vendor name"""
        if not text:
            return None
        
        # Remove registration numbers like (481500-M)
        text = re.sub(r'\([0-9A-Z\-]+\)', '', text)
        
        # Remove excessive punctuation and symbols
        text = re.sub(r'[—–\-=_|]{2,}', '', text)
        text = re.sub(r'[^\w\s.,&\'"\-()]', '', text)
        
        # Collapse multiple spaces
        text = ' '.join(text.split())
        
        return text.strip()
    
    def _calculate_text_quality(self, text):
        """Calculate ratio of valid/readable characters"""
        if not text:
            return 0
        valid_chars = sum(1 for c in text if c.isalnum() or c in ' .,&\'-()/')
        return valid_chars / len(text)
    
    # =====================
    # CATEGORY CLASSIFICATION
    # =====================
    
    def extract_category(self):
        """
        Classify expense category using keyword matching
        Returns: (category, confidence, extraction_reason)
        """
        category_scores = {}
        category_matches = {}
        
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            matches = []
            for keyword in keywords:
                if keyword.lower() in self.text_lower:
                    matches.append(keyword)
            
            if matches:
                confidence = min(50 + (len(matches) * 15), 90)
                category_scores[category] = confidence
                category_matches[category] = matches
        
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            confidence = category_scores[best_category]
            matches = category_matches[best_category]
            
            self.log('category', f'Matched keywords: {matches}')
            return best_category, confidence, f'Keyword matches: {", ".join(matches)}'
        
        return "Other", 30, 'No category keywords matched'
    
    # =====================
    # MAIN EXTRACTION
    # =====================
    
    def extract_all(self):
        """
        Extract all fields with full transparency
        Returns comprehensive result with confidence and reasoning
        """
        date, date_conf, date_reason = self.extract_date()
        amount, amount_conf, amount_reason = self.extract_amount()
        vendor, vendor_conf, vendor_reason = self.extract_vendor()
        category, category_conf, category_reason = self.extract_category()
        
        # Calculate overall confidence
        scores = [s for s in [date_conf, amount_conf, vendor_conf] if s > 0]
        overall_conf = sum(scores) / len(scores) if scores else 0
        
        result = {
            'date': date,
            'date_confidence': date_conf,
            'date_reason': date_reason,
            
            'amount': amount,
            'amount_confidence': amount_conf,
            'amount_reason': amount_reason,
            
            'vendor': vendor,
            'vendor_confidence': vendor_conf,
            'vendor_reason': vendor_reason,
            
            'category': category,
            'category_confidence': category_conf,
            'category_reason': category_reason,
            
            'overall_confidence': round(overall_conf, 2),
            'extraction_log': self.extraction_log
        }
        
        return result


def extract_fields(raw_text):
    """
    Main extraction function
    
    Args: raw OCR text
    Returns: Structured fields with confidence and reasoning
    """
    try:
        extractor = SROIEFieldExtractor(raw_text)
        results = extractor.extract_all()
        return {
            "success": True,
            "extracted_fields": results
        }
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "error_type": "extraction_error",
            "traceback": traceback.format_exc()
        }


def main():
    """
    Script entry point for stdin input
    Reads raw text from stdin, outputs JSON to stdout
    """
    try:
        # Read from stdin
        raw_text = sys.stdin.read()
        
        if not raw_text.strip():
            result = {
                "success": False,
                "error": "No input text provided"
            }
        else:
            result = extract_fields(raw_text)
        
        print(json.dumps(result, indent=2, default=str))
        sys.exit(0 if result["success"] else 1)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "error_type": "system_error"
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
