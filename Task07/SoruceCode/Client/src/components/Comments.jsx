import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getComments, createComment, deleteComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaTrash, FaPaperPlane } from 'react-icons/fa';
import './Comments.css';

const Comments = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const { data } = await getComments(postId);
      setComments(data.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await createComment(postId, newComment);
      setComments(prev => [...prev, data.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString();
  };

  return (
    <div className="comments-section">
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <FaUserCircle />
          )}
        </div>
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" disabled={submitting || !newComment.trim()}>
          <FaPaperPlane />
        </button>
      </form>

      {loading ? (
        <p className="loading-comments">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="no-comments">No comments yet</p>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment">
              <Link to={`/profile/${comment.user?.username}`} className="comment-avatar">
                {comment.user?.avatar ? (
                  <img src={comment.user.avatar} alt={comment.user.username} />
                ) : (
                  <FaUserCircle />
                )}
              </Link>
              
              <div className="comment-body">
                <div className="comment-content">
                  <Link to={`/profile/${comment.user?.username}`} className="comment-author">
                    {comment.user?.fullName || comment.user?.username}
                  </Link>
                  <p>{comment.content}</p>
                </div>
                <span className="comment-time">{formatDate(comment.createdAt)}</span>
              </div>
              
              {comment.user?._id === user?._id && (
                <button 
                  className="comment-delete"
                  onClick={() => handleDelete(comment._id)}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
