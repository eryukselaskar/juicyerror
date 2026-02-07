import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReservationModal from './ReservationModal';
import { getAvailability } from '../services/AvailabilityService';

// Mock the AvailabilityService
vi.mock('../services/AvailabilityService', () => ({
  getAvailability: vi.fn(),
}));

describe('ReservationModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Helper to generate availability
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    // Use padded month and day for the key
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-15`; // Pick the 15th

    getAvailability.mockResolvedValue({
        [dateStr]: true // Make the 15th available
    });
  });

  it('submits the form and does not log sensitive data', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { container } = render(<ReservationModal isOpen={true} onClose={onClose} />);

    // Fill the form fields
    const nameInput = container.querySelector('input[name="name"]');
    const emailInput = container.querySelector('input[name="email"]');
    const ideaTextarea = container.querySelector('textarea[name="idea"]');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(ideaTextarea, { target: { value: 'Awesome Tattoo' } });

    // Select a date from the calendar
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-15`;

    // Wait for the button to be in the document. It might take a moment to render after the effect.
    // Use regex to match the label
    const dateButton = await waitFor(() => screen.getByLabelText(new RegExp(`Date ${dateStr}, Available`)));

    fireEvent.click(dateButton);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitButton);

    // Should show "Sending..."
    expect(screen.getByText(/Sending\.\.\./i)).toBeInTheDocument();

    // Wait for the success message (mock submission takes 1500ms)
    await waitFor(() => expect(screen.getByText(/Request Sent/i)).toBeInTheDocument(), { timeout: 4000 });

    // Verify console.log was NOT called with sensitive data
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Reservation Submitted:'), expect.any(Object));
  });

  it('closes the modal after successful submission', async () => {
    const { container } = render(<ReservationModal isOpen={true} onClose={onClose} />);

    // Fill the form
    fireEvent.change(container.querySelector('textarea[name="idea"]'), { target: { value: 'Awesome Tattoo' } });
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: 'John Doe' } });
    fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'john@example.com' } });

    // Select a date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-15`;

    const dateButton = await waitFor(() => screen.getByLabelText(new RegExp(`Date ${dateStr}, Available`)));
    fireEvent.click(dateButton);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitButton);

    // Wait for the success message
    await waitFor(() => expect(screen.getByText(/Request Sent/i)).toBeInTheDocument(), { timeout: 4000 });

    // Wait for the modal to call onClose
    await waitFor(() => expect(onClose).toHaveBeenCalled(), { timeout: 4000 });
  });
});
