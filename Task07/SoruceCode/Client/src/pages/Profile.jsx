import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, getUserPosts, followUser, unfollowUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import EditProfile from '../components/EditProfile';
import { FaUserCircle, FaUserPlus, FaUserMinus, FaCog } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await getProfile(username);
      setProfile(data.data);
      
      const postsRes = await getUserPosts(data.data._id);
      setPosts(postsRes.data.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    
    try {
      if (profile.isFollowing) {
        await unfollowUser(profile._id);
        setProfile(prev => ({ 
          ...prev, 
          isFollowing: false,
          followersCount: prev.followersCount - 1
        }));
      } else {
        await followUser(profile._id);
        setProfile(prev => ({ 
          ...prev, 
          isFollowing: true,
          followersCount: prev.followersCount + 1
        }));
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="error">User not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} />
            ) : (
              <FaUserCircle />
            )}
          </div>
          
          <div className="profile-info">
            <h1>{profile.fullName || profile.username}</h1>
            <p className="username">@{profile.username}</p>
            {profile.bio && <p className="bio">{profile.bio}</p>}
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-count">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-count">{profile.followersCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-count">{profile.followingCount}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
          
          {isOwnProfile ? (
            <button 
              className="edit-profile-btn"
              onClick={() => setShowEditModal(true)}
            >
              <FaCog /> Edit Profile
            </button>
          ) : (
            <button 
              className={`follow-btn ${profile.isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {profile.isFollowing ? (
                <><FaUserMinus /> Unfollow</>
              ) : (
                <><FaUserPlus /> Follow</>
              )}
            </button>
          )}
        </div>
        
        <div className="profile-posts">
          <h2>Posts</h2>
          {posts.length === 0 ? (
            <p className="no-posts">No posts yet</p>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            ))
          )}
        </div>
      </main>

      {showEditModal && (
        <EditProfile 
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Profile;
