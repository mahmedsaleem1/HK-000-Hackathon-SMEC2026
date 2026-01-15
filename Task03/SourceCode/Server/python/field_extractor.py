"""
Field Extraction and Categorization Module
Extracts structured fields from receipt text using rule-based NLP

This module is completely EXPLAINABLE:
- Uses regex patterns (no black-box ML)
- All rules documented with clear logic
- Confidence scores based on pattern matching
- Keyword mapping for category classification

Input: Raw OCR text
Output: Structured fields with confidence scores
"""

import re
from datetime import datetime
import json

class FieldExtractor:
    """
    Extracts structured fields from receipt text
    Using rule-based patterns and keyword mapping
    """
    
    # Category keyword mapping
    CATEGORY_KEYWORDS = {
        "Food": [
            "restaurant", "cafe", "coffee", "pizza", "burger", "lunch", "dinner",
            "breakfast", "grocery", "supermarket", "market", "bakery", "food",
            "starbucks", "mcdonald", "subway", "taco", "sushi", "chinese",
            "pizza hut", "dominos", "kfc", "wendy", "chick-fil", "chipotle",
            "panera", "whole foods", "trader joe", "walmart", "target", "costco",
        ],
        "Travel": [
            "uber", "lyft", "taxi", "cab", "gas", "shell", "chevron", "mobil",
            "delta", "united", "american", "flight", "airport", "airline",
            "hotel", "hilton", "marriott", "hyatt", "airbnb", "booking",
            "train", "rail", "bus", "greyhound", "transit", "parking",
        ],
        "Shopping": [
            "amazon", "ebay", "store", "mall", "shop", "retail", "clothing",
            "apparel", "fashion", "nike", "adidas", "zara", "h&m", "gap",
            "target", "walmart", "costco", "best buy", "electronics",
            "furniture", "home", "ikea", "bed bath", "walmart",
        ],
        "Utilities": [
            "electric", "water", "gas", "internet", "phone", "verizon",
            "at&t", "comcast", "charter", "utility", "bill", "power",
            "service", "subscription",
        ],
        "Entertainment": [
            "movie", "cinema", "theater", "concert", "spotify", "netflix",
            "hulu", "disney", "gaming", "steam", "playstation", "xbox",
            "entertainment", "show", "ticket", "event",
        ],
    }
    
    def __init__(self, text):
        """Initialize extractor with raw OCR text"""
        self.text = text
        self.text_lower = text.lower()
        self.lines = text.split('\n')
    
    # =====================
    # DATE EXTRACTION LOGIC
    # =====================
    
    def extract_date(self):
        """
        Extract date from receipt text
        Tries multiple common date formats
        
        Formats supported:
        - MM/DD/YYYY (most common in US)
        - DD/MM/YYYY (common in Europe)
        - YYYY-MM-DD (ISO format)
        - MMM DD, YYYY (written format)
        
        Returns: (date_obj, confidence_score)
        """
        # Pattern 1: MM/DD/YYYY or DD/MM/YYYY
        pattern1 = r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})'
        matches = re.finditer(pattern1, self.text)
        
        for match in matches:
            try:
                month, day, year = match.groups()
                # Try MM/DD/YYYY first (US standard)
                if int(month) <= 12 and int(day) <= 31:
                    date = datetime(int(year), int(month), int(day))
                    return date, 90  # High confidence
                # Try DD/MM/YYYY
                elif int(day) <= 12 and int(month) <= 31:
                    date = datetime(int(year), int(day), int(month))
                    return date, 85  # Slightly lower due to ambiguity
            except ValueError:
                continue
        
        # Pattern 2: YYYY-MM-DD
        pattern2 = r'(\d{4})-(\d{1,2})-(\d{1,2})'
        matches = re.finditer(pattern2, self.text)
        
        for match in matches:
            try:
                year, month, day = match.groups()
                date = datetime(int(year), int(month), int(day))
                return date, 95  # Very high confidence (ISO format)
            except ValueError:
                continue
        
        pattern3 = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2}),? (\d{4})'
        match = re.search(pattern3, self.text, re.IGNORECASE)
        
        if match:
            try:
                month_str, day, year = match.groups()
                months = {
                    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
                    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
                }
                month = months[month_str.lower()[:3]]
                date = datetime(int(year), month, int(day))
                return date, 90
            except (ValueError, KeyError):
                pass
        
        return None, 0  # No date found
    
    # AMOUNT EXTRACTION LOGIC
    
    def extract_amount(self):
        """
        Extract total amount from receipt
        Looks for currency symbols followed by numbers
        Prefers larger amounts (likely totals vs line items)
        
        Formats:
        - Rs123.45
        - Rs 123.45
        - USD 123.45
        - TOTAL: Rs123.45
        - 123.45 (plain number)
        
        Returns: (amount, confidence_score)
        """
        amounts = []
        
        # Pattern 1: Rs followed by number (most common)
        pattern1 = r'\$\s*(\d+(?:\.\d{2})?)'
        for match in re.finditer(pattern1, self.text):
            amount = float(match.group(1))
            amounts.append((amount, 95))  # High confidence
        
        # Pattern 2: "TOTAL" or similar keywords
        total_pattern = r'(?:total|subtotal|amount due|grand total)[:\s]+\$?\s*(\d+(?:\.\d{2})?)'
        for match in re.finditer(total_pattern, self.text_lower):
            amount = float(match.group(1))
            amounts.append((amount, 98))  # Very high confidence
        
        # Pattern 3: Plain numbers (last resort)
        pattern3 = r'\b(\d+\.\d{2})\b'
        for match in re.finditer(pattern3, self.text):
            amount = float(match.group(1))
            # Only include if > 0.50 (likely not tips/single items)
            if amount > 0.50:
                amounts.append((amount, 70))  # Lower confidence
        
        if amounts:
            # Return largest amount (likely the total)
            amounts.sort(key=lambda x: x[0], reverse=True)
            return amounts[0]
        
        return None, 0
    
    # VENDOR EXTRACTION LOGIC
    
    def extract_vendor(self):
        """
        Extract vendor/merchant name from receipt
        Usually appears in first few lines
        
        Strategy:
        1. Look for known merchant patterns
        2. Check first non-empty lines
        3. Look for company name indicators
        
        Returns: (vendor_name, confidence_score)
        """
        # Pattern 1: Known merchant names
        known_merchants = {
            'starbucks': 95,
            'mcdonald': 95,
            'burger king': 95,
            'subway': 95,
            'amazon': 95,
            'walmart': 95,
            'target': 95,
            'costco': 95,
            'uber': 95,
            'lyft': 95,
        }
        
        for merchant, confidence in known_merchants.items():
            if merchant.lower() in self.text_lower:
                return merchant.title(), confidence
        
        # Pattern 2: Extract from header (first meaningful line)
        for line in self.lines:
            cleaned_line = line.strip().upper()
            if not cleaned_line or len(cleaned_line) < 3:
                continue
            if cleaned_line.replace('.', '').replace(',', '').isdigit():
                continue
            return line.strip(), 75  # Moderate confidence
        
        return None, 0
    
    # CATEGORY CLASSIFICATION LOGIC
    
    def extract_category(self):
        """
        Classify expense into category using keyword matching
        
        Categories:
        - Food: Restaurants, groceries, cafes
        - Travel: Transport, flights, hotels, gas
        - Shopping: Retail stores, clothing, electronics
        - Utilities: Bills, subscriptions, services
        - Entertainment: Movies, games, events
        - Other: Default fallback
        
        Returns: (category, confidence_score)
        """
        # Count keyword matches per category
        category_scores = {}
        
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            matches = 0
            for keyword in keywords:
                # Case-insensitive search
                if keyword.lower() in self.text_lower:
                    matches += 1
            
            if matches > 0:
                confidence = min(60 + (matches * 10), 95)
                category_scores[category] = confidence
        
        if category_scores:
            # Return category with highest score
            best_category = max(category_scores, key=category_scores.get)
            return best_category, category_scores[best_category]
        
        return "Other", 30  
    # OVERALL CONFIDENCE SCORE CALCULATION
    
    def calculate_overall_confidence(self, results):
        """
        Calculate overall extraction confidence
        Averages confidence scores from all fields
        """
        if not results:
            return 0
        
        scores = [
            results.get('date_confidence', 0),
            results.get('amount_confidence', 0),
            results.get('vendor_confidence', 0),
            results.get('category_confidence', 0),
        ]
        
        return sum(scores) / len([s for s in scores if s > 0])
    
    # MAIN EXTRACTION METHOD
    
    def extract_all_fields(self):
        """
        Extract all fields from receipt text
        
        Returns: Dictionary with all extracted fields and confidence scores
        """
        # Extract date
        date, date_conf = self.extract_date()
        
        # Extract amount
        amount, amount_conf = self.extract_amount()
        
        # Extract vendor
        vendor, vendor_conf = self.extract_vendor()
        
        # Extract category
        category, category_conf = self.extract_category()
        
        # Build results
        results = {
            "date": date.isoformat() if date else None,
            "date_confidence": date_conf,
            "amount": amount,
            "amount_confidence": amount_conf,
            "vendor": vendor,
            "vendor_confidence": vendor_conf,
            "category": category,
            "category_confidence": category_conf,
        }
        
        # Overall confidence
        results['overall_confidence'] = self.calculate_overall_confidence(results)
        
        return results

def extract_fields(raw_text):
    """
    Main function for field extraction
    
    Args: raw OCR text
    Returns: Extracted fields with confidence scores
    """
    try:
        extractor = FieldExtractor(raw_text)
        results = extractor.extract_all_fields()
        return {
            "success": True,
            "extracted_fields": results,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": "extraction_error",
        }

if __name__ == "__main__":
    # Test example
    test_text = """
    STARBUCKS
    123 Main Street
    
    Date: 01/14/2024
    
    Latte             $5.50
    Muffin            $3.50
    
    TOTAL            $9.00
    """
    
    result = extract_fields(test_text)
    print(json.dumps(result, indent=2))
