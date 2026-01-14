const TimeSlotPicker = ({ 
    dayAvailability, 
    bookedSlots = [], 
    slotDuration = 60, 
    onSlotSelect, 
    selectedSlot 
}) => {
    if (!dayAvailability?.available) {
        return (
            <div className="slots-unavailable">
                <p>This facility is not available on the selected day.</p>
            </div>
        );
    }

    const generateTimeSlots = () => {
        const slots = [];
        const [startHour, startMin] = dayAvailability.start.split(':').map(Number);
        const [endHour, endMin] = dayAvailability.end.split(':').map(Number);
        
        let currentTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        while (currentTime + slotDuration <= endTime) {
            const slotStart = `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`;
            const slotEnd = `${String(Math.floor((currentTime + slotDuration) / 60)).padStart(2, '0')}:${String((currentTime + slotDuration) % 60).padStart(2, '0')}`;
            
            // Check if slot is booked
            const isBooked = bookedSlots.some(booking => {
                const bookStart = booking.startTime;
                const bookEnd = booking.endTime;
                return (slotStart < bookEnd && slotEnd > bookStart);
            });

            slots.push({
                start: slotStart,
                end: slotEnd,
                isBooked,
                status: bookedSlots.find(b => b.startTime === slotStart)?.status
            });

            currentTime += slotDuration;
        }

        return slots;
    };

    const slots = generateTimeSlots();

    const formatTime = (time) => {
        const [hour, min] = time.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${String(min).padStart(2, '0')} ${ampm}`;
    };

    return (
        <div className="time-slot-picker">
            <div className="slots-header">
                <span>Available: {dayAvailability.start} - {dayAvailability.end}</span>
            </div>
            <div className="slots-grid">
                {slots.map((slot, index) => (
                    <button
                        key={index}
                        className={`time-slot ${slot.isBooked ? 'booked' : ''} 
                            ${slot.status === 'pending' ? 'pending' : ''} 
                            ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
                        disabled={slot.isBooked}
                        onClick={() => !slot.isBooked && onSlotSelect?.(slot)}
                    >
                        <span className="slot-time">{formatTime(slot.start)}</span>
                        <span className="slot-divider">-</span>
                        <span className="slot-time">{formatTime(slot.end)}</span>
                        {slot.isBooked && (
                            <span className="slot-status">
                                {slot.status === 'pending' ? 'Pending' : 'Booked'}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            {slots.length === 0 && (
                <p className="no-slots">No time slots available.</p>
            )}
        </div>
    );
};

export default TimeSlotPicker;
