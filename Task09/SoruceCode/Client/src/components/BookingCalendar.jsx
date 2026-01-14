import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BookingCalendar = ({ bookedSlots = [], onDateSelect, selectedDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];
        
        // Previous month padding
        for (let i = 0; i < startingDay; i++) {
            days.push({ date: null, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const bookingsOnDay = bookedSlots.filter(slot => 
                new Date(slot.date).toISOString().split('T')[0] === dateStr
            );
            
            days.push({
                date: i,
                dateStr,
                isCurrentMonth: true,
                isPast: new Date(dateStr) < new Date(new Date().toDateString()),
                bookings: bookingsOnDay
            });
        }

        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const goToPrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
        <div className="booking-calendar">
            <div className="calendar-header">
                <button onClick={goToPrevMonth} className="cal-nav-btn">
                    <ChevronLeft size={20} />
                </button>
                <h3 className="cal-month">{monthName}</h3>
                <button onClick={goToNextMonth} className="cal-nav-btn">
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                ))}
            </div>

            <div className="calendar-days">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day ${!day.isCurrentMonth ? 'empty' : ''} 
                            ${day.isPast ? 'past' : ''} 
                            ${day.dateStr === selectedDate ? 'selected' : ''}
                            ${day.bookings?.length > 0 ? 'has-bookings' : ''}`}
                        onClick={() => day.isCurrentMonth && !day.isPast && onDateSelect?.(day.dateStr)}
                    >
                        {day.date && (
                            <>
                                <span className="day-number">{day.date}</span>
                                {day.bookings?.length > 0 && (
                                    <span className="booking-indicator">{day.bookings.length}</span>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingCalendar;
