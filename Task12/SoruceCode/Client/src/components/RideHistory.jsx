import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import RideCard from './RideCard';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/history`);
      if (response.data.success) {
        setRides(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = rides.filter(ride => {
    if (filter === 'all') return true;
    return ride.status === filter;
  });

  const getStatusCounts = () => {
    return {
      all: rides.length,
      active: rides.filter(r => r.status === 'active').length,
      completed: rides.filter(r => r.status === 'completed').length,
      cancelled: rides.filter(r => r.status === 'cancelled').length
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="ride-history-container">
      <h2>Ride History</h2>
      <p className="subtitle">View all your past and current rides</p>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </button>
        <button 
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({counts.active})
        </button>
        <button 
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({counts.completed})
        </button>
        <button 
          className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({counts.cancelled})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading history...</div>
      ) : filteredRides.length > 0 ? (
        <div className="rides-list">
          {filteredRides.map(ride => (
            <div key={ride.id} className="history-item">
              <div className={`status-badge ${ride.status}`}>
                {ride.status}
              </div>
              <RideCard ride={ride} showBookings={true} />
            </div>
          ))}
        </div>
      ) : (
        <div className="no-rides">
          <p>No rides found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default RideHistory;
