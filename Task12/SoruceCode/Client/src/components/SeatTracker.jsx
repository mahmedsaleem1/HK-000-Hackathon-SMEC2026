import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const SeatTracker = ({ rideId }) => {
  const [seatData, setSeatData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeatData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchSeatData, 10000);
    return () => clearInterval(interval);
  }, [rideId]);

  const fetchSeatData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rides/${rideId}/seats`);
      if (response.data.success) {
        setSeatData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seat data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="seat-tracker-loading">Loading...</div>;
  if (!seatData) return null;

  const seats = [];
  for (let i = 0; i < seatData.totalSeats; i++) {
    const isBooked = i < seatData.bookedSeats;
    seats.push(
      <div 
        key={i} 
        className={`seat-icon ${isBooked ? 'booked' : 'available'}`}
        title={isBooked ? 'Booked' : 'Available'}
      >
        💺
      </div>
    );
  }

  return (
    <div className="seat-tracker-widget">
      <h4>Real-time Seat Availability</h4>
      <div className="seats-visual">
        {seats}
      </div>
      <div className="seat-legend">
        <span className="legend-item">
          <span className="legend-color available"></span> Available ({seatData.availableSeats})
        </span>
        <span className="legend-item">
          <span className="legend-color booked"></span> Booked ({seatData.bookedSeats})
        </span>
      </div>
      {seatData.bookings && seatData.bookings.length > 0 && (
        <div className="current-passengers">
          <h5>Passengers:</h5>
          <ul>
            {seatData.bookings.map(b => (
              <li key={b.id}>
                {b.passengerName} - {b.seatsBooked} seat{b.seatsBooked > 1 ? 's' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeatTracker;
