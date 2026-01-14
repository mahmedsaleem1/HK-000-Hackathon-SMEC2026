import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { FaCamera, FaKeyboard, FaTimes, FaUserPlus, FaSpinner } from 'react-icons/fa';
import './QRScanner.css';

const QRScanner = ({ onScan, onClose }) => {
  const [mode, setMode] = useState('choose'); // 'choose', 'camera', 'manual'
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    setMode('camera');
    setError('');
    
    // Wait for DOM to render
    setTimeout(() => {
      try {
        scannerRef.current = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            showTorchButtonIfSupported: true,
          },
          false
        );

        scannerRef.current.render(
          (decodedText) => {
            // Success callback
            console.log('QR Code scanned:', decodedText);
            scannerRef.current.clear().then(() => {
              setIsScanning(false);
              onScan(decodedText);
            }).catch(console.error);
          },
          (errorMessage) => {
            // Error callback - ignore, just means no QR found yet
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Scanner error:', err);
        setError('Could not start scanner. Please use manual entry.');
        setMode('manual');
      }
    }, 100);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim().length > 0) {
      onScan(manualCode.trim().toUpperCase());
    }
  };

  const handleClose = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error clearing scanner:', err);
      }
    }
    setIsScanning(false);
    onClose();
  };

  const switchToManual = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error clearing scanner:', err);
      }
    }
    setIsScanning(false);
    setMode('manual');
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-modal">
        <button className="close-btn" onClick={handleClose}>
          <FaTimes />
        </button>
        
        <h2><FaUserPlus /> Connect with Friend</h2>
        
        {mode === 'choose' && (
          <div className="mode-selection">
            <button className="mode-btn camera" onClick={startScanner}>
              <FaCamera />
              <span>Scan QR Code</span>
            </button>
            <button className="mode-btn manual" onClick={() => setMode('manual')}>
              <FaKeyboard />
              <span>Enter Code Manually</span>
            </button>
          </div>
        )}
        
        {mode === 'camera' && (
          <div className="camera-mode">
            <div id="qr-reader"></div>
            <p className="scan-hint">Point your camera at a QR code</p>
            <button className="switch-btn" onClick={switchToManual}>
              <FaKeyboard /> Enter code manually
            </button>
          </div>
        )}
        
        {mode === 'manual' && (
          <div className="manual-mode">
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Enter friend's code"
                maxLength={8}
                autoFocus
              />
              <button type="submit" className="submit-btn">
                <FaUserPlus /> Connect
              </button>
            </form>
            <button className="switch-btn" onClick={() => startScanner()}>
              <FaCamera /> Scan QR instead
            </button>
          </div>
        )}
        
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
};

export default QRScanner;
