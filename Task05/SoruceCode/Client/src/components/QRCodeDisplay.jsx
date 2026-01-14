import { QRCodeSVG } from 'qrcode.react';
import { FaQrcode, FaCopy, FaCheck, FaInstagram, FaSnapchatGhost, FaPhone, FaEdit } from 'react-icons/fa';
import { useState } from 'react';
import './QRCodeDisplay.css';

const QRCodeDisplay = ({ user, onEditSocials }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasSocialInfo = user.socialInfo && (
    user.socialInfo.instagram || 
    user.socialInfo.snapchat || 
    user.socialInfo.phone
  );

  return (
    <div className="qr-display">
      <div className="qr-header">
        <FaQrcode className="qr-icon" />
        <h3>Your QR Code</h3>
      </div>
      
      <div className="qr-code-container">
        <QRCodeSVG 
          value={user.qrCode}
          size={200}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#1a1a2e"
        />
      </div>
      
      <div className="qr-code-text">
        <span className="code">{user.qrCode}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? <FaCheck /> : <FaCopy />}
        </button>
      </div>
      
      <p className="qr-hint">Share this code or let friends scan it to connect!</p>
      
      {/* User's Social Info Section */}
      <div className="my-socials-section">
        <div className="my-socials-header">
          <h4>Your Social Info</h4>
          <button className="edit-socials-btn" onClick={onEditSocials} title="Edit">
            <FaEdit />
          </button>
        </div>
        {hasSocialInfo ? (
          <div className="my-socials-list">
            {user.socialInfo.instagram && (
              <div className="my-social-item">
                <FaInstagram className="social-icon instagram" />
                <span>@{user.socialInfo.instagram}</span>
              </div>
            )}
            {user.socialInfo.snapchat && (
              <div className="my-social-item">
                <FaSnapchatGhost className="social-icon snapchat" />
                <span>{user.socialInfo.snapchat}</span>
              </div>
            )}
            {user.socialInfo.phone && (
              <div className="my-social-item">
                <FaPhone className="social-icon phone" />
                <span>{user.socialInfo.phone}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="no-socials">No social info added yet. Click edit to add!</p>
        )}
      </div>
    </div>
  );
};

export default QRCodeDisplay;
