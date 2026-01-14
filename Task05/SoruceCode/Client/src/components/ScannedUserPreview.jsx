import { FaTimes, FaUserPlus, FaInstagram, FaSnapchatGhost, FaPhone } from 'react-icons/fa';
import './ScannedUserPreview.css';

const ScannedUserPreview = ({ user, onConfirm, onCancel }) => {
  const hasSocialInfo = user.socialInfo && (
    user.socialInfo.instagram || 
    user.socialInfo.snapchat || 
    user.socialInfo.phone
  );

  return (
    <div className="preview-overlay">
      <div className="preview-modal">
        <button className="close-btn" onClick={onCancel}>
          <FaTimes />
        </button>
        
        <div className="preview-header">
          <h2>Friend Found! 🎉</h2>
        </div>
        
        <div className="preview-content">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="preview-avatar"
          />
          <h3 className="preview-name">{user.name}</h3>
          
          {hasSocialInfo && (
            <div className="preview-socials">
              {user.socialInfo.instagram && (
                <div className="social-item">
                  <FaInstagram className="social-icon instagram" />
                  <span>@{user.socialInfo.instagram}</span>
                </div>
              )}
              {user.socialInfo.snapchat && (
                <div className="social-item">
                  <FaSnapchatGhost className="social-icon snapchat" />
                  <span>{user.socialInfo.snapchat}</span>
                </div>
              )}
              {user.socialInfo.phone && (
                <div className="social-item">
                  <FaPhone className="social-icon phone" />
                  <span>{user.socialInfo.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="preview-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            <FaUserPlus /> Add Friend
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScannedUserPreview;
