
import sys
import json
import cv2
import pytesseract
from PIL import Image
import traceback
import os

# Configure Tesseract path for Windows
if os.name == 'nt':  # Windows
    tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path

def preprocess_image(image_path):
    
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Cannot read image: {image_path}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
        
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
        denoised = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        denoised = cv2.morphologyEx(denoised, cv2.MORPH_OPEN, kernel)
        
        height, width = denoised.shape
        if height < 300 or width < 300:
            scale = max(300 / height, 300 / width)
            new_height = int(height * scale)
            new_width = int(width * scale)
            denoised = cv2.resize(denoised, (new_width, new_height), 
                                 interpolation=cv2.INTER_CUBIC)
        
        return denoised
    except Exception as e:
        raise RuntimeError(f"Image preprocessing failed: {str(e)}")

def extract_text_with_tesseract(image):
   
    try:
        custom_config = r'--psm 6 --oem 3'
        
        text = pytesseract.image_to_string(image, config=custom_config)
        
        if not text or text.strip() == "":
            raise ValueError("No text extracted from image")
        
        return text
    except Exception as e:
        raise RuntimeError(f"OCR extraction failed: {str(e)}")

def process_receipt(image_path):
    
    try:
        processed_image = preprocess_image(image_path)
        
        raw_text = extract_text_with_tesseract(processed_image)
        
        result = {
            "success": True,
            "raw_text": raw_text,
            "ocr_method": "Tesseract",
            "image_path": image_path,
        }
        
        return result
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": "ocr_error",
            "traceback": traceback.format_exc(),
        }

def main():
    if len(sys.argv) < 2:
        error_result = {
            "success": False,
            "error": "Image path not provided",
            "usage": "python ocr_processor.py <image_path>",
        }
        print(json.dumps(error_result))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    result = process_receipt(image_path)
    
    print(json.dumps(result, indent=2))
    
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main()
