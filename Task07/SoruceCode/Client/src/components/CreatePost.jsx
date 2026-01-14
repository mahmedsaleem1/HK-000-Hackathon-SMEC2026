import { useState, useRef } from 'react';
import { createPost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaImage, FaTimes } from 'react-icons/fa';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !imageFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('images', imageFile);

      const { data } = await createPost(formData);
      onPostCreated(data.data);
      setContent('');
      removeImage();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <div className="create-post-header">
        <div className="user-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <FaUserCircle />
          )}
        </div>
        <span className="user-greeting">What's on your mind, {user?.fullName || user?.username}?</span>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Share something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button type="button" className="remove-image" onClick={removeImage}>
              <FaTimes />
            </button>
          </div>
        )}

        <div className="image-input">
          <label className="file-label">
            <FaImage />
            <span>{imageFile ? imageFile.name : 'Choose an image (required)'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              hidden
            />
          </label>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" disabled={loading || !content.trim() || !imageFile}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
