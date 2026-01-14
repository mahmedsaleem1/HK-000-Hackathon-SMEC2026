import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import LocationInput from './LocationInput';
import RouteMap from './RouteMap';

const PostRide = ({ onRidePosted }) => {
  const [formData, setFormData] = useState({
    driverName: '',
    driverPhone: '',
    origin: null,
    destination: null,
    departureDate: '',
    departureTime: '',
    totalSeats: 1,
    pricePerSeat: 0,
    vehicleInfo: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.origin || !formData.destination) {
      setError('Please select both origin and destination');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/rides`, formData);
      if (response.data.success) {
        setSuccess('Ride posted successfully!');
        setFormData({
          driverName: '',
          driverPhone: '',
          origin: null,
          destination: null,
          departureDate: '',
          departureTime: '',
          totalSeats: 1,
          pricePerSeat: 0,
          vehicleInfo: '',
          notes: ''
        });
        if (onRidePosted) onRidePosted(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="post-ride-container">
      <h2>Offer a Ride</h2>
      <p className="subtitle">Share your commute and reduce costs</p>

      <div className="post-ride-content">
        <form onSubmit={handleSubmit} className="ride-form">
          <div className="form-section">
            <h3>Driver Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="driverPhone"
                  value={formData.driverPhone}
                  onChange={handleChange}
                  placeholder="+92 xxx xxxxxxx"
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Route Details</h3>
            <div className="form-row">
              <div className="form-group">
                <LocationInput
                  label="Pickup Location"
                  value={formData.origin}
                  onChange={(loc) => setFormData(prev => ({ ...prev, origin: loc }))}
                  placeholder="Enter pickup address"
                />
              </div>
              <div className="form-group">
                <LocationInput
                  label="Drop-off Location"
                  value={formData.destination}
                  onChange={(loc) => setFormData(prev => ({ ...prev, destination: loc }))}
                  placeholder="Enter destination address"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Schedule</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Departure Date</label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Ride Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Available Seats</label>
                <select
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  className="form-input"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Price per Seat (PKR)</label>
                <input
                  type="number"
                  name="pricePerSeat"
                  value={formData.pricePerSeat}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Vehicle Information</label>
              <input
                type="text"
                name="vehicleInfo"
                value={formData.vehicleInfo}
                onChange={handleChange}
                placeholder="e.g., Toyota Corolla - White - ABC-123"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any preferences or rules..."
                className="form-input"
                rows="3"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Ride'}
          </button>
        </form>

        <div className="map-preview">
          <h3>Route Preview</h3>
          <RouteMap origin={formData.origin} destination={formData.destination} height="350px" />
        </div>
      </div>
    </div>
  );
};

export default PostRide;
