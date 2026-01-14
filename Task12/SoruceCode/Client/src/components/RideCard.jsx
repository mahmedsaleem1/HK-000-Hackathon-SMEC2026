import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import RouteMap from './RouteMap';

const RideCard = ({ ride, onBookingComplete, showBookings = false }) => {
  const [showMap, setShowMap] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    seatsRequested: 1,
    pickupPoint: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/rides/${ride.id}/book`, bookingData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Booking confirmed!' });
        setShowBookingForm(false);
        setBookingData({
          passengerName: '',
          passengerPhone: '',
          passengerEmail: '',
          seatsRequested: 1,
          pickupPoint: ''
        });
        if (onBookingComplete) onBookingComplete();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Booking failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className={`ride-card ${ride.availableSeats === 0 ? 'fully-booked' : ''}`}>
      <div className="ride-header">
        <div className="driver-info">
          <div className="driver-avatar">
            {ride.driverName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{ride.driverName}</h3>
            <span className="driver-phone">{ride.driverPhone}</span>
          </div>
        </div>
        <div className="ride-price">
          <span className="price-amount">Rs. {ride.pricePerSeat}</span>
          <span className="price-label">per seat</span>
        </div>
      </div>

      <div className="ride-route">
        <div className="route-point origin">
          <div className="point-marker"></div>
          <div className="point-details">
            <span className="point-label">From</span>
            <span className="point-address">{ride.origin.address}</span>
          </div>
        </div>
        <div className="route-line"></div>
        <div className="route-point destination">
          <div className="point-marker"></div>
          <div className="point-details">
            <span className="point-label">To</span>
            <span className="point-address">{ride.destination.address}</span>
          </div>
        </div>
      </div>

      <div className="ride-details">
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span>{formatDate(ride.departureDate)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">⏰</span>
          <span>{formatTime(ride.departureTime)}</span>
        </div>
        <div className="detail-item seats">
          <span className="detail-icon">💺</span>
          <span className={ride.availableSeats === 0 ? 'no-seats' : ''}>
            {ride.availableSeats} / {ride.totalSeats} seats
          </span>
        </div>
      </div>

      {ride.vehicleInfo && (
        <div className="vehicle-info">
          🚗 {ride.vehicleInfo}
        </div>
      )}

      {ride.notes && (
        <div className="ride-notes">
          📝 {ride.notes}
        </div>
      )}

      <div className="seat-tracker">
        <div className="seat-bar">
          <div 
            className="seat-filled" 
            style={{ width: `${((ride.totalSeats - ride.availableSeats) / ride.totalSeats) * 100}%` }}
          ></div>
        </div>
        <span className="seat-text">
          {ride.totalSeats - ride.availableSeats} booked, {ride.availableSeats} available
        </span>
      </div>

      <div className="ride-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? 'Hide Map' : 'View Route'}
        </button>
        {ride.availableSeats > 0 && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowBookingForm(!showBookingForm)}
          >
            {showBookingForm ? 'Cancel' : 'Book Seat'}
          </button>
        )}
      </div>

      {showMap && (
        <div className="ride-map">
          <RouteMap origin={ride.origin} destination={ride.destination} height="250px" />
        </div>
      )}

      {showBookingForm && (
        <form onSubmit={handleBooking} className="booking-form">
          <h4>Book Your Seat</h4>
          <div className="form-row">
            <input
              type="text"
              placeholder="Your Name"
              value={bookingData.passengerName}
              onChange={(e) => setBookingData({...bookingData, passengerName: e.target.value})}
              required
              className="form-input"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={bookingData.passengerPhone}
              onChange={(e) => setBookingData({...bookingData, passengerPhone: e.target.value})}
              required
              className="form-input"
            />
          </div>
          <div className="form-row">
            <input
              type="email"
              placeholder="Email (optional)"
              value={bookingData.passengerEmail}
              onChange={(e) => setBookingData({...bookingData, passengerEmail: e.target.value})}
              className="form-input"
            />
            <select
              value={bookingData.seatsRequested}
              onChange={(e) => setBookingData({...bookingData, seatsRequested: parseInt(e.target.value)})}
              className="form-input"
            >
              {Array.from({ length: ride.availableSeats }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Pickup point (optional)"
            value={bookingData.pickupPoint}
            onChange={(e) => setBookingData({...bookingData, pickupPoint: e.target.value})}
            className="form-input full-width"
          />
          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      )}

      {showBookings && ride.bookings && ride.bookings.length > 0 && (
        <div className="bookings-list">
          <h4>Passengers ({ride.bookings.filter(b => b.status === 'confirmed').length})</h4>
          {ride.bookings.filter(b => b.status === 'confirmed').map(booking => (
            <div key={booking.id} className="booking-item">
              <span>{booking.passengerName}</span>
              <span>{booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
              <span>{booking.passengerPhone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideCard;
