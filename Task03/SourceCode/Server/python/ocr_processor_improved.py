"""
Enhanced OCR Processor with Improved Preprocessing
Implements academically-sound, explainable improvements

Changes from original:
1. Adaptive thresholding (handles uneven lighting)
2. Deskewing (corrects tilted scans)  
3. CLAHE contrast enhancement
4. Better Tesseract configuration for receipts
"""

import sys
import json
import cv2
import numpy as np
import pytesseract
from PIL import Image
import traceback
import os

# Configure Tesseract path for Windows
if os.name == 'nt':  # Windows
    tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path


class ImagePreprocessor:
    """
    Explainable image preprocessing pipeline
    Each step is documented with rationale
    """
    
    def __init__(self, debug=False):
        self.debug = debug
        self.preprocessing_log = []
    
    def log(self, step, description):
        """Log preprocessing step for transparency"""
        self.preprocessing_log.append({
            'step': step,
            'description': description
        })
    
    def preprocess(self, image_path):
        """
        Main preprocessing pipeline
        Returns: preprocessed image, preprocessing log
        """
        self.preprocessing_log = []
        
        # Step 1: Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Cannot read image: {image_path}")
        self.log(1, f"Loaded image: {image.shape}")
        
        # Step 2: Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        self.log(2, "Converted to grayscale")
        
        # Step 3: Resize if too small (improves OCR accuracy)
        gray = self._resize_if_needed(gray)
        
        # Step 4: Deskew (correct rotation)
        gray = self._deskew(gray)
        
        # Step 5: Enhance contrast using CLAHE
        gray = self._enhance_contrast(gray)
        
        # Step 6: Apply adaptive thresholding
        binary = self._adaptive_threshold(gray)
        
        # Step 7: Denoise using morphological operations
        cleaned = self._denoise(binary)
        
        return cleaned, self.preprocessing_log
    
    def _resize_if_needed(self, gray):
        """
        Resize small images for better OCR
        Tesseract works best with 300+ DPI
        """
        height, width = gray.shape
        min_dimension = 800  # Minimum dimension for good OCR
        
        if height < min_dimension or width < min_dimension:
            scale = max(min_dimension / height, min_dimension / width)
            new_height = int(height * scale)
            new_width = int(width * scale)
            gray = cv2.resize(gray, (new_width, new_height), 
                            interpolation=cv2.INTER_CUBIC)
            self.log(3, f"Resized from ({width}, {height}) to ({new_width}, {new_height})")
        else:
            self.log(3, "No resize needed (image already large enough)")
        
        return gray
    
    def _deskew(self, gray):
        """
        Correct image rotation using Hough Line Transform
        
        Rationale: Tilted text significantly reduces OCR accuracy.
        We detect dominant horizontal lines and rotate to align them.
        """
        # Edge detection
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        
        # Detect lines
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, 
                               threshold=100, minLineLength=100, maxLineGap=10)
        
        if lines is not None and len(lines) > 0:
            angles = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                if x2 != x1:  # Avoid division by zero
                    angle = np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi
                    # Only consider nearly-horizontal lines
                    if abs(angle) < 30:
                        angles.append(angle)
            
            if angles:
                median_angle = np.median(angles)
                
                # Only correct if angle is significant but not too large
                if 0.5 < abs(median_angle) < 15:
                    (h, w) = gray.shape
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
                    gray = cv2.warpAffine(gray, M, (w, h),
                                         flags=cv2.INTER_CUBIC,
                                         borderMode=cv2.BORDER_REPLICATE)
                    self.log(4, f"Deskewed by {median_angle:.2f} degrees")
                    return gray
        
        self.log(4, "No significant skew detected")
        return gray
    
    def _enhance_contrast(self, gray):
        """
        Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        
        Rationale: Receipts often have faded text or uneven printing.
        CLAHE enhances local contrast without amplifying noise.
        """
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        self.log(5, "Applied CLAHE contrast enhancement")
        return enhanced
    
    def _adaptive_threshold(self, gray):
        """
        Apply adaptive thresholding
        
        Rationale: Unlike global thresholding (fixed value like 150),
        adaptive thresholding calculates different thresholds for 
        different regions, handling shadows and uneven lighting.
        """
        # Try adaptive thresholding with adjusted parameters
        binary = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=15,  # Larger neighborhood for receipts
            C=8            # Higher constant for better text separation
        )
        self.log(6, "Applied adaptive Gaussian thresholding (blockSize=15, C=8)")
        return binary
    
    def _denoise(self, binary):
        """
        Remove noise using morphological operations
        
        Rationale: Receipt scans often have speckle noise.
        Opening (erosion + dilation) removes small white spots.
        Closing (dilation + erosion) fills small black gaps in characters.
        """
        # Use 2x2 kernel (larger than original 1x1 for actual effect)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        
        # Opening: removes small white noise
        opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        
        # Closing: fills small black holes
        cleaned = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel)
        
        self.log(7, "Applied morphological opening and closing (kernel=2x2)")
        return cleaned


def extract_text_with_tesseract(image, config_mode='receipt'):
    """
    Extract text from preprocessed image using Tesseract OCR
    
    Config modes:
    - 'receipt': Optimized for receipt layouts (PSM 4)
    - 'block': Single text block (PSM 6, original mode)
    - 'sparse': Sparse text with whitespace (PSM 11)
    
    PSM (Page Segmentation Mode) explanations:
    - PSM 3: Fully automatic page segmentation
    - PSM 4: Single column of text of variable sizes (best for receipts)
    - PSM 6: Single uniform block of text
    - PSM 11: Sparse text, find as much text as possible
    """
    configs = {
        'receipt': r'--psm 4 --oem 3',
        'block': r'--psm 6 --oem 3',
        'sparse': r'--psm 11 --oem 3',
        'auto': r'--psm 3 --oem 3'
    }
    
    config = configs.get(config_mode, configs['receipt'])
    
    try:
        text = pytesseract.image_to_string(image, config=config)
        
        if not text or text.strip() == "":
            # Fallback: try different PSM mode
            fallback_config = r'--psm 3 --oem 3'
            text = pytesseract.image_to_string(image, config=fallback_config)
        
        return text, config_mode
    except Exception as e:
        raise RuntimeError(f"OCR extraction failed: {str(e)}")


def process_receipt(image_path, config_mode='receipt'):
    """
    Main OCR pipeline with improved preprocessing
    Tries multiple strategies to get the best result
    
    Returns structured result with transparency about processing steps
    """
    try:
        # Strategy 1: Full preprocessing pipeline
        preprocessor = ImagePreprocessor()
        processed_image, preprocessing_log = preprocessor.preprocess(image_path)
        raw_text, ocr_mode = extract_text_with_tesseract(processed_image, config_mode)
        
        # If text is too short, try simpler preprocessing
        if len(raw_text.strip()) < 20:
            # Strategy 2: Simple grayscale + Otsu thresholding
            image = cv2.imread(image_path)
            if image is not None:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                
                # Try Otsu's thresholding (automatic threshold)
                _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                text2, _ = extract_text_with_tesseract(otsu, 'auto')
                
                if len(text2.strip()) > len(raw_text.strip()):
                    raw_text = text2
                    preprocessing_log.append({
                        'step': 8,
                        'description': 'Fallback: Used Otsu thresholding (better result)'
                    })
        
        # If still too short, try original image with different PSM
        if len(raw_text.strip()) < 20:
            image = cv2.imread(image_path)
            if image is not None:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                text3, _ = extract_text_with_tesseract(gray, 'auto')
                
                if len(text3.strip()) > len(raw_text.strip()):
                    raw_text = text3
                    preprocessing_log.append({
                        'step': 9,
                        'description': 'Fallback: Used grayscale only (better result)'
                    })
        
        # Calculate quality metrics
        quality_metrics = {
            'text_length': len(raw_text),
            'line_count': len(raw_text.split('\n')),
            'word_count': len(raw_text.split()),
            'digit_ratio': sum(c.isdigit() for c in raw_text) / max(len(raw_text), 1),
            'alpha_ratio': sum(c.isalpha() for c in raw_text) / max(len(raw_text), 1)
        }
        
        result = {
            "success": True,
            "raw_text": raw_text,
            "ocr_method": "Tesseract",
            "ocr_mode": ocr_mode,
            "image_path": image_path,
            "preprocessing_steps": preprocessing_log,
            "quality_metrics": quality_metrics
        }
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": "ocr_error",
            "traceback": traceback.format_exc()
        }


def main():
    """
    Script entry point
    Usage: python ocr_processor_improved.py <image_path> [config_mode]
    
    Config modes: receipt (default), block, sparse, auto
    """
    if len(sys.argv) < 2:
        error_result = {
            "success": False,
            "error": "Image path not provided",
            "usage": "python ocr_processor_improved.py <image_path> [config_mode]"
        }
        print(json.dumps(error_result))
        sys.exit(1)
    
    image_path = sys.argv[1]
    config_mode = sys.argv[2] if len(sys.argv) > 2 else 'receipt'
    
    # Process receipt
    result = process_receipt(image_path, config_mode)
    
    # Output as JSON to stdout
    print(json.dumps(result, indent=2))
    
    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
