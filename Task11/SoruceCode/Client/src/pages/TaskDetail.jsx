import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksAPI, bidsAPI } from '../config/api';
import { getSocket, joinTaskRoom, leaveTaskRoom } from '../config/socket';
import { useAuth } from '../store/AuthContext';
import BidForm from '../components/BidForm';
import BidCard from '../components/BidCard';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [task, setTask] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchTask();
    joinTaskRoom(id);

    const socket = getSocket();
    
    socket.on('newBid', ({ taskId, bid }) => {
      if (taskId === id) {
        setBids(prev => [bid, ...prev]);
      }
    });

    socket.on('bidAccepted', ({ taskId, bid }) => {
      if (taskId === id) {
        fetchTask();
      }
    });

    return () => {
      leaveTaskRoom(id);
      socket.off('newBid');
      socket.off('bidAccepted');
    };
  }, [id]);

  useEffect(() => {
    if (task) {
      fetchBids();
    }
  }, [sortBy, task?._id]);

  const fetchTask = async () => {
    try {
      const response = await tasksAPI.getOne(id);
      setTask(response.data.task);
      setBids(response.data.task.bids || []);
    } catch (error) {
      toast.error('Task not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await bidsAPI.getTaskBids(id, sortBy);
      setBids(response.data.bids);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handleBidSubmit = async (bidData) => {
    try {
      await bidsAPI.create({ taskId: id, ...bidData });
      toast.success('Bid placed successfully!');
      setShowBidForm(false);
      fetchBids();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error placing bid');
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await bidsAPI.accept(bidId);
      toast.success('Bid accepted! Task is now in progress.');
      fetchTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error accepting bid');
    }
  };

  const handleCompleteTask = async (bidId, rating, feedback) => {
    try {
      await bidsAPI.complete(bidId, { rating, feedback });
      toast.success('Task completed! Worker portfolio updated.');
      fetchTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error completing task');
    }
  };

  if (loading) return <div className="loading">Loading task details...</div>;
  if (!task) return <div className="not-found">Task not found</div>;

  const isOwner = user && task.postedBy._id === user.id;
  const hasBid = bids.some(b => b.bidder._id === user?.id);
  const canBid = isAuthenticated && !isOwner && task.status === 'open' && !hasBid;

  return (
    <div className="task-detail-page">
      <div className="task-detail-header">
        <div className="task-status-badge" data-status={task.status}>
          {task.status.toUpperCase()}
        </div>
        <h1>{task.title}</h1>
        <div className="task-meta">
          <span className="category">{task.category}</span>
          <span className="urgency" data-urgency={task.urgency}>{task.urgency}</span>
          <span className="budget">${task.budget.min} - ${task.budget.max} ({task.budget.type})</span>
        </div>
      </div>

      <div className="task-detail-content">
        <div className="task-main">
          <section className="task-description">
            <h3>Description</h3>
            <p>{task.description}</p>
          </section>

          {task.skills.length > 0 && (
            <section className="task-skills">
              <h3>Required Skills</h3>
              <div className="skills-list">
                {task.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            </section>
          )}

          <section className="task-deadline">
            <h3>Deadline</h3>
            <p>{format(new Date(task.deadline), 'PPpp')}</p>
          </section>

          <section className="task-poster">
            <h3>Posted By</h3>
            <div className="poster-info">
              <span className="poster-name">{task.postedBy.name}</span>
              <span className="poster-rating">⭐ {task.postedBy.rating?.average?.toFixed(1) || 'New'}</span>
            </div>
          </section>

          {task.assignedTo && (
            <section className="task-assigned">
              <h3>Assigned To</h3>
              <div className="assigned-info">
                <span>{task.assignedTo.name}</span>
                <span>⭐ {task.assignedTo.rating?.average?.toFixed(1) || 'New'}</span>
              </div>
            </section>
          )}
        </div>

        <div className="task-sidebar">
          {canBid && (
            <button className="btn btn-primary btn-full" onClick={() => setShowBidForm(true)}>
              Place Your Bid
            </button>
          )}

          {showBidForm && (
            <BidForm 
              task={task} 
              onSubmit={handleBidSubmit} 
              onCancel={() => setShowBidForm(false)} 
            />
          )}

          {task.status === 'open' && (
            <section className="bids-section">
              <div className="bids-header">
                <h3>Bids ({bids.length})</h3>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="">Latest</option>
                  <option value="price">Lowest Price</option>
                  <option value="time">Fastest Delivery</option>
                </select>
              </div>

              {bids.length === 0 ? (
                <p className="no-bids">No bids yet. Be the first!</p>
              ) : (
                <div className="bids-list">
                  {bids.map(bid => (
                    <BidCard 
                      key={bid._id} 
                      bid={bid} 
                      isOwner={isOwner}
                      onAccept={() => handleAcceptBid(bid._id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {task.status === 'in-progress' && isOwner && task.acceptedBid && (
            <section className="complete-section">
              <h3>Mark as Complete</h3>
              <CompleteTaskForm onComplete={(rating, feedback) => 
                handleCompleteTask(task.acceptedBid._id || task.acceptedBid, rating, feedback)
              } />
            </section>
          )}

          {task.status === 'completed' && task.completionDetails && (
            <section className="completed-info">
              <h3>Completion Details</h3>
              <p>Rating: {'⭐'.repeat(task.completionDetails.rating)}</p>
              <p>Feedback: {task.completionDetails.feedback}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

const CompleteTaskForm = ({ onComplete }) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(rating, feedback);
  };

  return (
    <form onSubmit={handleSubmit} className="complete-form">
      <div className="form-group">
        <label>Rating</label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map(num => (
            <button 
              key={num} 
              type="button" 
              className={`star ${rating >= num ? 'active' : ''}`}
              onClick={() => setRating(num)}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="How was your experience?"
          rows={3}
        />
      </div>
      <button type="submit" className="btn btn-success">
        Complete Task
      </button>
    </form>
  );
};

export default TaskDetail;
