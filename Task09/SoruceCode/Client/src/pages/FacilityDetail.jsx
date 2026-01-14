import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { facilityService, reservationService } from '../services/api';
import BookingCalendar from '../components/BookingCalendar';
import TimeSlotPicker from '../components/TimeSlotPicker';
import toast from 'react-hot-toast';
import { 
    MapPin, Users, Clock, CheckCircle, AlertCircle, 
    ArrowLeft, Calendar as CalendarIcon 
} from 'lucide-react';
import { categoryLabels } from '../components/FacilityCard';

const FacilityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    const [facility, setFacility] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [availability, setAvailability] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [calendarData, setCalendarData] = useState([]);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingData, setBookingData] = useState({
        title: '',
        purpose: '',
        attendees: 1,
        contactPhone: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFacility();
    }, [id]);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailability();
        }
    }, [selectedDate]);

    useEffect(() => {
        if (facility) {
            fetchCalendarData();
        }
    }, [facility]);

    const fetchFacility = async () => {
        try {
            const data = await facilityService.getById(id);
            setFacility(data.facility);
        } catch (error) {
            toast.error('Facility not found');
            navigate('/facilities');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailability = async () => {
        try {
            const data = await facilityService.getAvailability(id, selectedDate);
            setAvailability(data);
        } catch (error) {
            console.error('Failed to fetch availability:', error);
        }
    };

    const fetchCalendarData = async () => {
        const now = new Date();
        try {
            const data = await reservationService.getCalendar(id, now.getMonth() + 1, now.getFullYear());
            setCalendarData(data.reservations);
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        setShowBookingForm(false);
    };

    const handleSlotSelect = (slot) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to book');
            navigate('/login');
            return;
        }
        setSelectedSlot(slot);
        setShowBookingForm(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedSlot || !selectedDate) {
            toast.error('Please select a date and time slot');
            return;
        }

        setSubmitting(true);

        try {
            await reservationService.create({
                facility: id,
                title: bookingData.title,
                purpose: bookingData.purpose,
                date: selectedDate,
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                attendees: parseInt(bookingData.attendees),
                contactPhone: bookingData.contactPhone
            });

            toast.success(
                facility.requiresApproval 
                    ? 'Booking submitted for approval!' 
                    : 'Booking confirmed!'
            );
            navigate('/my-bookings');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
            </div>
        );
    }

    if (!facility) return null;

    return (
        <div className="facility-detail-page">
            <button className="back-btn" onClick={() => navigate('/facilities')}>
                <ArrowLeft size={18} />
                Back to Facilities
            </button>

            <div className="detail-layout">
                <div className="detail-main">
                    <div className="facility-header">
                        <span className="category-tag">{categoryLabels[facility.category]}</span>
                        <h1>{facility.name}</h1>
                        
                        <div className="facility-info-row">
                            {facility.location && (
                                <span className="info-item">
                                    <MapPin size={16} />
                                    {facility.location.building}
                                    {facility.location.floor && `, ${facility.location.floor} Floor`}
                                    {facility.location.room && `, Room ${facility.location.room}`}
                                </span>
                            )}
                            <span className="info-item">
                                <Users size={16} />
                                Capacity: {facility.capacity}
                            </span>
                            <span className="info-item">
                                <Clock size={16} />
                                {facility.defaultSlotDuration} min slots
                            </span>
                        </div>

                        {facility.requiresApproval ? (
                            <div className="notice warning">
                                <AlertCircle size={16} />
                                This facility requires admin approval for bookings
                            </div>
                        ) : (
                            <div className="notice success">
                                <CheckCircle size={16} />
                                Instant booking available
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>About</h3>
                        <p>{facility.description}</p>
                    </div>

                    {facility.amenities?.length > 0 && (
                        <div className="detail-section">
                            <h3>Amenities</h3>
                            <div className="amenities-list">
                                {facility.amenities.map((amenity, index) => (
                                    <span key={index} className="amenity-tag">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="detail-sidebar">
                    <div className="booking-section">
                        <h3>
                            <CalendarIcon size={18} />
                            Book This Facility
                        </h3>

                        <BookingCalendar
                            bookedSlots={calendarData}
                            onDateSelect={handleDateSelect}
                            selectedDate={selectedDate}
                        />

                        {selectedDate && availability && (
                            <div className="slots-section">
                                <h4>Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}</h4>
                                <TimeSlotPicker
                                    dayAvailability={availability.dayAvailability}
                                    bookedSlots={availability.bookedSlots}
                                    slotDuration={facility.defaultSlotDuration}
                                    onSlotSelect={handleSlotSelect}
                                    selectedSlot={selectedSlot}
                                />
                            </div>
                        )}

                        {showBookingForm && selectedSlot && (
                            <form onSubmit={handleBookingSubmit} className="booking-form">
                                <h4>Complete Your Booking</h4>
                                <p className="selected-time">
                                    {selectedDate} • {selectedSlot.start} - {selectedSlot.end}
                                </p>

                                <div className="form-group">
                                    <label>Booking Title *</label>
                                    <input
                                        type="text"
                                        value={bookingData.title}
                                        onChange={(e) => setBookingData({ ...bookingData, title: e.target.value })}
                                        placeholder="e.g., Project Meeting, Lab Session"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Purpose</label>
                                    <textarea
                                        value={bookingData.purpose}
                                        onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                                        placeholder="Brief description of your booking purpose"
                                        rows={2}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Attendees</label>
                                        <input
                                            type="number"
                                            value={bookingData.attendees}
                                            onChange={(e) => setBookingData({ ...bookingData, attendees: e.target.value })}
                                            min={1}
                                            max={facility.capacity}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Phone</label>
                                        <input
                                            type="tel"
                                            value={bookingData.contactPhone}
                                            onChange={(e) => setBookingData({ ...bookingData, contactPhone: e.target.value })}
                                            placeholder="For urgent contact"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-book" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Confirm Booking'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilityDetail;
