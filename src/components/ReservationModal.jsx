import React, { useState, useEffect } from 'react';
import './ReservationModal.css';

const ReservationModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        idea: '',
        placement: '',
        date: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setFormData({
                name: '',
                email: '',
                idea: '',
                placement: '',
                date: ''
            });
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mock submission
        setTimeout(() => {
            console.log('Reservation Submitted:', formData);
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1500);
    };

    // We render it always so CSS transitions can work,
    // but use CSS to hide it (visibility: hidden, opacity: 0)
    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                {isSuccess ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <h2 className="modal-title">Request Sent</h2>
                        <p style={{ color: 'var(--color-text-secondary)' }}>We'll be in touch shortly.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="modal-title">Book Appointment</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tattoo Idea</label>
                                <textarea
                                    name="idea"
                                    className="form-textarea"
                                    required
                                    placeholder="Describe your vision..."
                                    value={formData.idea}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Placement</label>
                                <input
                                    type="text"
                                    name="placement"
                                    className="form-input"
                                    placeholder="e.g. Forearm, Back, Leg"
                                    value={formData.placement}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Preferred Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary form-submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Submit Request'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReservationModal;
