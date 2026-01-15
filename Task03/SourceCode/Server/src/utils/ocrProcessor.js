/**
 * OCR Processor - Node.js Integration
 * Executes Python OCR scripts and field extractor
 * Handles child_process execution and JSON parsing
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Execute Python OCR script
 * Tesseract extracts raw text from image
 */
const executeOCR = (imagePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../python/ocr_processor.py');
    const pythonProcess = spawn('python', [pythonScript, imagePath]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`OCR process failed with code ${code}: ${error}`));
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (parseError) {
        reject(new Error(`Failed to parse OCR output: ${parseError.message}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
};

/**
 * Execute Python field extractor
 * Converts raw text to structured fields with confidence scores
 */
const executeFieldExtraction = (rawText) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../python/field_extractor.py');
    const pythonProcess = spawn('python', [pythonScript]);

    let output = '';
    let error = '';

    // Send raw text to stdin
    pythonProcess.stdin.write(rawText);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Field extraction failed with code ${code}: ${error}`));
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (parseError) {
        reject(new Error(`Failed to parse extraction output: ${parseError.message}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
};

/**
 * Full OCR pipeline
 * Runs both OCR and field extraction
 */
const processReceiptImage = async (imagePath) => {
  try {
    // Step 1: OCR - Extract text from image
    console.log('Starting OCR processing...');
    const ocrResult = await executeOCR(imagePath);

    if (!ocrResult.success) {
      throw new Error(`OCR failed: ${ocrResult.error}`);
    }

    const rawText = ocrResult.raw_text;

    // Step 2: Field Extraction - Convert text to structured data
    console.log('Starting field extraction...');
    const extractionResult = await executeFieldExtraction(rawText);

    if (!extractionResult.success) {
      throw new Error(`Field extraction failed: ${extractionResult.error}`);
    }

    // Combine results
    return {
      success: true,
      ocr: ocrResult,
      extraction: extractionResult,
      raw_text: rawText,
      extracted_fields: extractionResult.extracted_fields,
      processing_timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      error_type: error.message.includes('OCR') ? 'ocr_error' : 'extraction_error',
    };
  }
};

module.exports = {
  executeOCR,
  executeFieldExtraction,
  processReceiptImage,
};
