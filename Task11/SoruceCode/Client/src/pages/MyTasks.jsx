import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI, bidsAPI } from '../config/api';
import { useAuth } from '../store/AuthContext';

const MyTasks = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posted');
  const [postedTasks, setPostedTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [posted, assigned, bids] = await Promise.all([
        tasksAPI.getMyPosted(),
        tasksAPI.getMyAssigned(),
        bidsAPI.getMyBids()
      ]);
      setPostedTasks(posted.data.tasks);
      setAssignedTasks(assigned.data.tasks);
      setMyBids(bids.data.bids);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading your tasks...</div>;

  return (
    <div className="my-tasks-page">
      <h1>My Tasks</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'posted' ? 'active' : ''}`}
          onClick={() => setActiveTab('posted')}
        >
          Posted Tasks ({postedTasks.length})
        </button>
        <button 
          className={`tab ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          Working On ({assignedTasks.length})
        </button>
        <button 
          className={`tab ${activeTab === 'bids' ? 'active' : ''}`}
          onClick={() => setActiveTab('bids')}
        >
          My Bids ({myBids.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'posted' && (
          <div className="tasks-list">
            {postedTasks.length === 0 ? (
              <div className="empty-state">
                <p>You haven't posted any tasks yet.</p>
                <Link to="/create-task" className="btn btn-primary">Post Your First Task</Link>
              </div>
            ) : (
              postedTasks.map(task => (
                <Link to={`/task/${task._id}`} key={task._id} className="task-list-item">
                  <div className="task-info">
                    <h3>{task.title}</h3>
                    <span className="status-badge" data-status={task.status}>{task.status}</span>
                  </div>
                  <div className="task-meta">
                    <span>{task.bids?.length || 0} bids</span>
                    <span>${task.budget.min} - ${task.budget.max}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'assigned' && (
          <div className="tasks-list">
            {assignedTasks.length === 0 ? (
              <div className="empty-state">
                <p>You're not working on any tasks yet.</p>
                <Link to="/" className="btn btn-primary">Browse Tasks</Link>
              </div>
            ) : (
              assignedTasks.map(task => (
                <Link to={`/task/${task._id}`} key={task._id} className="task-list-item">
                  <div className="task-info">
                    <h3>{task.title}</h3>
                    <span className="status-badge" data-status={task.status}>{task.status}</span>
                  </div>
                  <div className="task-meta">
                    <span>Posted by: {task.postedBy.name}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'bids' && (
          <div className="bids-list">
            {myBids.length === 0 ? (
              <div className="empty-state">
                <p>You haven't placed any bids yet.</p>
                <Link to="/" className="btn btn-primary">Find Tasks to Bid On</Link>
              </div>
            ) : (
              myBids.map(bid => (
                <Link to={`/task/${bid.task._id}`} key={bid._id} className="bid-list-item">
                  <div className="bid-info">
                    <h3>{bid.task.title}</h3>
                    <span className="bid-status" data-status={bid.status}>{bid.status}</span>
                  </div>
                  <div className="bid-meta">
                    <span>Your bid: ${bid.amount}</span>
                    <span>Delivery: {bid.deliveryTime.value} {bid.deliveryTime.unit}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
