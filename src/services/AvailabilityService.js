/**
 * Mock Availability Service
 *
 * Simulates an API call to fetch availability for a given month.
 * Returns an object where keys are dates (YYYY-MM-DD) and values are booleans
 * (true = available, false = booked).
 */

export const getAvailability = async (year, month) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const availability = {};

    // Generate mock data for the requested month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];

        // Randomly assign availability (approx 40% booked)
        // Ensure weekends are more likely to be booked for realism
        const dayOfWeek = date.getDay();
        let isBooked = Math.random() < 0.4;

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            isBooked = Math.random() < 0.7; // Higher chance for weekends
        }

        // Ensure today and past dates are "booked" (unavailable)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            isBooked = true; // Treat past as booked/unavailable
        }

        availability[dateString] = !isBooked;
    }

    return availability;
};
