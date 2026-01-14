import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import RideCard from './RideCard';

const SearchRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: '',
    seats: ''
  });

  const fetchRides = async (params = {}) => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v)
      ).toString();
      
      const url = queryString 
        ? `${API_BASE_URL}/rides/search?${queryString}`
        : `${API_BASE_URL}/rides`;
      
      const response = await axios.get(url);
      if (response.data.success) {
        setRides(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides(searchParams);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingComplete = () => {
    fetchRides(searchParams);
  };

  return (
    <div className="search-rides-container">
      <h2>Find a Ride</h2>
      <p className="subtitle">Search for available rides to your destination</p>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-inputs">
          <input
            type="text"
            name="origin"
            value={searchParams.origin}
            onChange={handleChange}
            placeholder="From (e.g., Gulshan)"
            className="form-input"
          />
          <input
            type="text"
            name="destination"
            value={searchParams.destination}
            onChange={handleChange}
            placeholder="To (e.g., FAST)"
            className="form-input"
          />
          <input
            type="date"
            name="date"
            value={searchParams.date}
            onChange={handleChange}
            className="form-input"
          />
          <select
            name="seats"
            value={searchParams.seats}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Any seats</option>
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n}>{n}+ seat{n > 1 ? 's' : ''}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="loading">Loading rides...</div>
      ) : rides.length > 0 ? (
        <div className="rides-grid">
          {rides.map(ride => (
            <RideCard 
              key={ride.id} 
              ride={ride} 
              onBookingComplete={handleBookingComplete}
            />
          ))}
        </div>
      ) : (
        <div className="no-rides">
          <p>No rides found. Try adjusting your search or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default SearchRides;
