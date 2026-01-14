import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../config/api';
import { getSocket } from '../config/socket';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import { useAuth } from '../store/AuthContext';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'open',
    category: '',
    search: '',
    sortBy: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    const socket = getSocket();
    
    socket.on('newTask', (task) => {
      if (filters.status === 'open' || filters.status === '') {
        setTasks(prev => [task, ...prev]);
      }
    });

    socket.on('taskUpdated', (updatedTask) => {
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    });

    socket.on('taskDeleted', (taskId) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    });

    return () => {
      socket.off('newTask');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, [filters.status]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll(filters);
      setTasks(response.data.tasks);
      setPagination({
        page: response.data.currentPage,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🎓 Student Gig Board</h1>
        <p>Find quick tasks or post your own gigs</p>
        {isAuthenticated && (
          <Link to="/create-task" className="btn btn-primary">
            + Post a Task
          </Link>
        )}
      </div>

      <TaskFilters filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="no-tasks">
          <p>No tasks found. Be the first to post one!</p>
        </div>
      ) : (
        <>
          <div className="task-grid">
            {tasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
          
          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, page: i + 1 })}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
