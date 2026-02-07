import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReservationModal from './ReservationModal';

describe('ReservationModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the form and does not log sensitive data', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { container } = render(<ReservationModal isOpen={true} onClose={onClose} />);

    // Fill the form
    const nameInput = container.querySelector('input[name="name"]');
    const emailInput = container.querySelector('input[name="email"]');
    const ideaTextarea = container.querySelector('textarea[name="idea"]');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(ideaTextarea, { target: { value: 'Awesome Tattoo' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitButton);

    // Should show "Sending..."
    expect(screen.getByText(/Sending\.\.\./i)).toBeInTheDocument();

    // Wait for the success message (mock submission takes 1500ms)
    await waitFor(() => expect(screen.getByText(/Request Sent/i)).toBeInTheDocument(), { timeout: 3000 });

    // Verify console.log was NOT called with sensitive data
    // The vulnerable code was: console.log('Reservation Submitted:', formData);
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Reservation Submitted:'), expect.any(Object));

    // In this specific case, we expect NO logs at all during submission
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('closes the modal after successful submission', async () => {
    render(<ReservationModal isOpen={true} onClose={onClose} />);

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText(/Describe your vision/i), { target: { value: 'Awesome Tattoo' } });
    fireEvent.change(document.querySelector('input[name="name"]'), { target: { value: 'John Doe' } });
    fireEvent.change(document.querySelector('input[name="email"]'), { target: { value: 'john@example.com' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

    // Wait for the success message
    await waitFor(() => expect(screen.getByText(/Request Sent/i)).toBeInTheDocument(), { timeout: 3000 });

    // Wait for the modal to call onClose (it has a 2000ms timeout after success)
    await waitFor(() => expect(onClose).toHaveBeenCalled(), { timeout: 4000 });
  });
});
