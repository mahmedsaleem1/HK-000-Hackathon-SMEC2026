import { useState } from 'react';
import { FaTimes, FaSave, FaInstagram, FaSnapchatGhost, FaPhone } from 'react-icons/fa';
import './EditSocialsModal.css';

const EditSocialsModal = ({ user, onSave, onClose }) => {
  const [socialInfo, setSocialInfo] = useState({
    instagram: user.socialInfo?.instagram || '',
    snapchat: user.socialInfo?.snapchat || '',
    phone: user.socialInfo?.phone || ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setSocialInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(socialInfo);
    setSaving(false);
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>Edit Social Info</h2>
        <p className="modal-subtitle">This info will be visible to friends who connect with you</p>
        
        <form onSubmit={handleSubmit}>
          <div className="edit-input-group">
            <FaInstagram className="input-icon instagram" />
            <input
              type="text"
              value={socialInfo.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder="Instagram username"
              maxLength={30}
            />
          </div>
          
          <div className="edit-input-group">
            <FaSnapchatGhost className="input-icon snapchat" />
            <input
              type="text"
              value={socialInfo.snapchat}
              onChange={(e) => handleChange('snapchat', e.target.value)}
              placeholder="Snapchat username"
              maxLength={30}
            />
          </div>
          
          <div className="edit-input-group">
            <FaPhone className="input-icon phone" />
            <input
              type="tel"
              value={socialInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Phone number"
              maxLength={15}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : <><FaSave /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSocialsModal;
