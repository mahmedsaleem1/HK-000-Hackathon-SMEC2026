import { useState, useRef } from 'react';
import { updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaTimes, FaCamera, FaSave } from 'react-icons/fa';
import './EditProfile.css';

const EditProfile = ({ profile, onClose, onUpdate }) => {
  const { updateUser } = useAuth();
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const { data } = await updateProfile(formData);
      
      // Update local user state
      updateUser(data.data);
      
      // Notify parent component
      onUpdate(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="avatar-section">
            <div className="avatar-preview" onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" />
              ) : (
                <FaUserCircle />
              )}
              <div className="avatar-overlay">
                <FaCamera />
                <span>Change Photo</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              hidden
            />
            <p className="avatar-hint">Click to upload a new avatar</p>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              <FaSave />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
