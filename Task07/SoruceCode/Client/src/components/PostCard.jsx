import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleLike, deletePost } from '../services/api';
import Comments from './Comments';
import { 
  FaHeart, FaRegHeart, FaComment, FaTrash, FaUserCircle,
  FaThumbsUp, FaLaugh, FaSurprise, FaSadTear, FaAngry 
} from 'react-icons/fa';
import './PostCard.css';

const REACTIONS = [
  { type: 'like', icon: FaThumbsUp, color: '#00d9ff', label: 'Like' },
  { type: 'love', icon: FaHeart, color: '#ff006e', label: 'Love' },
  { type: 'haha', icon: FaLaugh, color: '#f59e0b', label: 'Haha' },
  { type: 'wow', icon: FaSurprise, color: '#8b5cf6', label: 'Wow' },
  { type: 'sad', icon: FaSadTear, color: '#3b82f6', label: 'Sad' },
  { type: 'angry', icon: FaAngry, color: '#ef4444', label: 'Angry' },
];

const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [liking, setLiking] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(
    post.userReaction || (post.likes?.includes(user?._id) ? 'like' : null)
  );
  const hideTimeoutRef = useRef(null);

  const isLiked = post.likes?.includes(user?._id) || currentReaction;
  const isOwner = post.user?._id === user?._id;

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 300);
  };

  const handleReaction = async (reactionType) => {
    if (liking) return;
    setLiking(true);
    setShowReactions(false);
    
    try {
      // If clicking the same reaction, remove it
      if (currentReaction === reactionType) {
        setCurrentReaction(null);
      } else {
        setCurrentReaction(reactionType);
      }
      
      const { data } = await toggleLike(post._id);
      onUpdate(data.data);
    } catch (error) {
      console.error('Reaction error:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id);
        onDelete(post._id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const getCurrentReactionData = () => {
    return REACTIONS.find(r => r.type === currentReaction) || REACTIONS[0];
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.user?.username}`} className="post-author">
          <div className="author-avatar">
            {post.user?.avatar ? (
              <img src={post.user.avatar} alt={post.user.username} />
            ) : (
              <FaUserCircle />
            )}
          </div>
          <div className="author-info">
            <span className="author-name">{post.user?.fullName || post.user?.username}</span>
            <span className="post-time">{formatDate(post.createdAt)}</span>
          </div>
        </Link>
        
        {isOwner && (
          <button className="delete-btn" onClick={handleDelete}>
            <FaTrash />
          </button>
        )}
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.image && <img src={post.image} alt="Post" className="post-image" />}
      </div>
      
      <div className="post-stats">
        <div className="reaction-summary">
          {post.likes?.length > 0 && (
            <div className="reaction-icons-summary">
              <FaThumbsUp style={{ color: '#00d9ff' }} />
              <FaHeart style={{ color: '#ff006e' }} />
            </div>
          )}
          <span>{post.likeCount || post.likes?.length || 0} reactions</span>
        </div>
        <span>{post.commentCount || 0} comments</span>
      </div>
      
      <div className="post-actions">
        <div 
          className="reaction-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showReactions && (
            <div className="reaction-picker">
              {REACTIONS.map((reaction) => {
                const Icon = reaction.icon;
                return (
                  <button
                    key={reaction.type}
                    className={`reaction-option ${currentReaction === reaction.type ? 'active' : ''}`}
                    onClick={() => handleReaction(reaction.type)}
                    title={reaction.label}
                    style={{ '--reaction-color': reaction.color }}
                  >
                    <Icon />
                  </button>
                );
              })}
            </div>
          )}
          <button 
            className={`action-btn ${isLiked ? 'reacted' : ''}`}
            onClick={() => handleReaction(currentReaction || 'like')}
            disabled={liking}
            style={currentReaction ? { '--reaction-color': getCurrentReactionData().color } : {}}
          >
            {currentReaction ? (
              <>
                {(() => {
                  const ReactionIcon = getCurrentReactionData().icon;
                  return <ReactionIcon style={{ color: getCurrentReactionData().color }} />;
                })()}
                <span style={{ color: getCurrentReactionData().color }}>{getCurrentReactionData().label}</span>
              </>
            ) : (
              <>
                <FaRegHeart />
                <span>Like</span>
              </>
            )}
          </button>
        </div>
        
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <FaComment />
          <span>Comment</span>
        </button>
      </div>
      
      {showComments && (
        <Comments postId={post._id} />
      )}
    </article>
  );
};

export default PostCard;
