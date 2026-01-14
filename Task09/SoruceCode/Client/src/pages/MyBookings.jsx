import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '../services/api';
import toast from 'react-hot-toast';
import { 
    Calendar, Clock, MapPin, CheckCircle, XCircle, 
    AlertCircle, Loader, ExternalLink 
} from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter !== 'all') params.status = filter;
            
            const data = await reservationService.getMyBookings(params);
            setBookings(data.reservations);
        } catch (error) {
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        
        setCancelling(id);
        try {
            await reservationService.cancel(id);
            toast.success('Booking cancelled');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cancellation failed');
        } finally {
            setCancelling(null);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { icon: AlertCircle, color: 'warning', label: 'Pending Approval' },
            approved: { icon: CheckCircle, color: 'success', label: 'Approved' },
            declined: { icon: XCircle, color: 'danger', label: 'Declined' },
            cancelled: { icon: XCircle, color: 'muted', label: 'Cancelled' },
            completed: { icon: CheckCircle, color: 'info', label: 'Completed' }
        };
        const { icon: Icon, color, label } = config[status] || config.pending;
        return (
            <span className={`status-badge ${color}`}>
                <Icon size={14} />
                {label}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="my-bookings-page">
            <div className="page-header">
                <h1>My Bookings</h1>
                <p>View and manage your facility reservations</p>
            </div>

            <div className="filter-tabs">
                {['all', 'pending', 'approved', 'declined', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        className={`tab-btn ${filter === status ? 'active' : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader className="spinner" size={32} />
                    <p>Loading your bookings...</p>
                </div>
            ) : bookings.length > 0 ? (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                                <div>
                                    <h3>{booking.title}</h3>
                                    <Link 
                                        to={`/facilities/${booking.facility?._id}`}
                                        className="facility-link"
                                    >
                                        {booking.facility?.name}
                                        <ExternalLink size={12} />
                                    </Link>
                                </div>
                                {getStatusBadge(booking.status)}
                            </div>

                            <div className="booking-details">
                                <div className="detail-item">
                                    <Calendar size={16} />
                                    <span>{formatDate(booking.date)}</span>
                                </div>
                                <div className="detail-item">
                                    <Clock size={16} />
                                    <span>{booking.startTime} - {booking.endTime}</span>
                                </div>
                                {booking.facility?.location && (
                                    <div className="detail-item">
                                        <MapPin size={16} />
                                        <span>
                                            {booking.facility.location.building}
                                            {booking.facility.location.room && `, Room ${booking.facility.location.room}`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {booking.adminRemarks && (
                                <div className="admin-remarks">
                                    <strong>Admin remarks:</strong> {booking.adminRemarks}
                                </div>
                            )}

                            {['pending', 'approved'].includes(booking.status) && 
                             new Date(booking.date) >= new Date(new Date().toDateString()) && (
                                <div className="booking-actions">
                                    <button
                                        className="btn-cancel"
                                        onClick={() => handleCancel(booking._id)}
                                        disabled={cancelling === booking._id}
                                    >
                                        {cancelling === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <span className="empty-icon">📅</span>
                    <h3>No bookings found</h3>
                    <p>
                        {filter === 'all' 
                            ? "You haven't made any bookings yet." 
                            : `No ${filter} bookings.`}
                    </p>
                    <Link to="/facilities" className="btn-primary">
                        Browse Facilities
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
