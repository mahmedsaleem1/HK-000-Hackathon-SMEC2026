import { useState } from 'react';
import { FaUserPlus, FaInstagram, FaSnapchatGhost, FaPhone, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './UserSetup.css';

const UserSetup = ({ onCreateUser, loading }) => {
  const [name, setName] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [socialInfo, setSocialInfo] = useState({
    instagram: '',
    snapchat: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateUser(name.trim(), socialInfo);
    }
  };

  const handleSocialChange = (field, value) => {
    setSocialInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="user-setup">
      <div className="setup-card">
        <div className="setup-icon">
          <span>🔗</span>
        </div>
        <h1>QR Connect</h1>
        <p className="tagline">Connect with friends instantly via QR codes</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name *"
            maxLength={30}
            disabled={loading}
            autoFocus
            className="name-input"
          />
          
          <button 
            type="button" 
            className="toggle-optional"
            onClick={() => setShowOptional(!showOptional)}
          >
            {showOptional ? <FaChevronUp /> : <FaChevronDown />}
            Add Social Info (Optional)
          </button>
          
          {showOptional && (
            <div className="social-inputs">
              <div className="social-input-group">
                <FaInstagram className="social-icon instagram" />
                <input
                  type="text"
                  value={socialInfo.instagram}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="Instagram username"
                  maxLength={30}
                  disabled={loading}
                />
              </div>
              <div className="social-input-group">
                <FaSnapchatGhost className="social-icon snapchat" />
                <input
                  type="text"
                  value={socialInfo.snapchat}
                  onChange={(e) => handleSocialChange('snapchat', e.target.value)}
                  placeholder="Snapchat username"
                  maxLength={30}
                  disabled={loading}
                />
              </div>
              <div className="social-input-group">
                <FaPhone className="social-icon phone" />
                <input
                  type="tel"
                  value={socialInfo.phone}
                  onChange={(e) => handleSocialChange('phone', e.target.value)}
                  placeholder="Phone number"
                  maxLength={15}
                  disabled={loading}
                />
              </div>
            </div>
          )}
          
          <button type="submit" className="submit-btn" disabled={!name.trim() || loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <FaUserPlus /> Get Started
              </>
            )}
          </button>
        </form>
        
        <div className="features">
          <div className="feature">
            <span>📱</span>
            <p>Generate unique QR code</p>
          </div>
          <div className="feature">
            <span>📷</span>
            <p>Scan to connect instantly</p>
          </div>
          <div className="feature">
            <span>🤝</span>
            <p>Share your socials</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSetup;
