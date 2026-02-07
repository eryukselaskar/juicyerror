import React, { useState, useEffect } from 'react';
import { getAvailability } from '../services/AvailabilityService';
import './Calendar.css';

const Calendar = ({ selectedDate, onDateSelect }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            try {
                const year = viewDate.getFullYear();
                const month = viewDate.getMonth();
                const data = await getAvailability(year, month);
                setAvailability(data);
            } catch (error) {
                console.error("Failed to fetch availability:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [viewDate]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 0 = Sunday, 1 = Monday, etc.
        const startDay = firstDayOfMonth.getDay();

        const days = [];

        // Empty slots for days before the 1st of the month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            // Format YYYY-MM-DD manually to avoid timezone issues
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Determine availability
            // API returns boolean: true = available, false = booked
            // Undefined means loading or error (treat as disabled)
            const isAvailable = availability[dateStr] === true;
            const isBooked = availability[dateStr] === false;
            const isSelected = selectedDate === dateStr;
            const isLoading = loading && availability[dateStr] === undefined;

            let className = 'calendar-day';
            let isDisabled = true; // Default to disabled

            if (isSelected) {
                className += ' selected';
                isDisabled = false; // Allow re-clicking selected (or maybe toggle off?)
            } else if (isBooked) {
                className += ' booked';
                isDisabled = true;
            } else if (isAvailable) {
                className += ' available';
                isDisabled = false;
            } else {
                // Loading or unknown state
                isDisabled = true;
            }

            // Accessibility label
            let ariaLabel = `Date ${dateStr}, ${isBooked ? 'Booked' : isAvailable ? 'Available' : 'Unavailable'}`;
            if (isSelected) ariaLabel += ', Selected';

            days.push(
                <button
                    key={dateStr}
                    className={className}
                    onClick={(e) => {
                        e.preventDefault();
                        if (!isDisabled) {
                            onDateSelect(dateStr);
                        }
                    }}
                    disabled={isDisabled}
                    aria-label={ariaLabel}
                    type="button"
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button
                    className="calendar-nav-btn"
                    onClick={(e) => { e.preventDefault(); handlePrevMonth(); }}
                    aria-label="Previous month"
                    type="button"
                >
                    &lt;
                </button>
                <div className="calendar-title">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </div>
                <button
                    className="calendar-nav-btn"
                    onClick={(e) => { e.preventDefault(); handleNextMonth(); }}
                    aria-label="Next month"
                    type="button"
                >
                    &gt;
                </button>
            </div>

            <div className="calendar-grid">
                <div className="calendar-weekday">Sun</div>
                <div className="calendar-weekday">Mon</div>
                <div className="calendar-weekday">Tue</div>
                <div className="calendar-weekday">Wed</div>
                <div className="calendar-weekday">Thu</div>
                <div className="calendar-weekday">Fri</div>
                <div className="calendar-weekday">Sat</div>

                {renderDays()}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color legend-available"></div>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color legend-booked"></div>
                    <span>Booked</span>
                </div>
            </div>

            <p className="calendar-helper-text">
                Each tattoo session takes one full day. Only available days can be selected.
            </p>
        </div>
    );
};

export default Calendar;
