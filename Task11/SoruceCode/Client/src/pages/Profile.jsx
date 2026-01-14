import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../config/api';
import { useAuth } from '../store/AuthContext';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: ''
  });

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      if (isOwnProfile && currentUser) {
        setProfile(currentUser);
        setFormData({
          name: currentUser.name,
          bio: currentUser.bio || '',
          skills: currentUser.skills?.join(', ') || ''
        });
      } else if (userId) {
        const response = await authAPI.getPortfolio(userId);
        setProfile(response.data.portfolio);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const result = await updateProfile({
      name: formData.name,
      bio: formData.bio,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    });
    
    if (result.success) {
      setEditing(false);
      fetchProfile();
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="not-found">Profile not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar || profile.name?.charAt(0).toUpperCase()}
        </div>
        
        {editing ? (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="edit-name"
          />
        ) : (
          <h1>{profile.name}</h1>
        )}
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">⭐ {profile.rating?.average?.toFixed(1) || '0'}</span>
            <span className="stat-label">Rating ({profile.rating?.count || 0} reviews)</span>
          </div>
          <div className="stat">
            <span className="stat-value">{profile.completedTasks || 0}</span>
            <span className="stat-label">Completed Tasks</span>
          </div>
        </div>

        {isOwnProfile && (
          <div className="profile-actions">
            {editing ? (
              <>
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>
        )}
      </div>

      <div className="profile-content">
        <section className="profile-bio">
          <h3>About</h3>
          {editing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
            />
          ) : (
            <p>{profile.bio || 'No bio yet'}</p>
          )}
        </section>

        <section className="profile-skills">
          <h3>Skills</h3>
          {editing ? (
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Skills (comma separated)"
            />
          ) : (
            <div className="skills-list">
              {profile.skills?.length > 0 ? (
                profile.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))
              ) : (
                <p>No skills listed</p>
              )}
            </div>
          )}
        </section>

        <section className="profile-portfolio">
          <h3>Portfolio ({profile.portfolio?.length || 0} completed projects)</h3>
          {profile.portfolio?.length > 0 ? (
            <div className="portfolio-grid">
              {profile.portfolio.map((item, i) => (
                <div key={i} className="portfolio-item">
                  <h4>{item.title}</h4>
                  <p>{item.description?.substring(0, 100)}...</p>
                  <div className="portfolio-meta">
                    <span>{'⭐'.repeat(item.rating || 0)}</span>
                    {item.feedback && <p className="feedback">"{item.feedback}"</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-portfolio">Complete tasks to build your portfolio!</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
