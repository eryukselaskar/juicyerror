import React, { useState } from 'react';
import './Sections.css';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        idea: '',
        placement: '',
        date: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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
            // Reset form after a delay if desired, or just show success message
        }, 1500);
    };

    return (
        <div className="section-container">
            <h2 className="section-title">Contact & Booking</h2>
            <div className="contact-wrapper">
                <div className="contact-info-container">
                    <p className="about-text">
                        Ready to start your project? Fill out the form or reach out directly.
                    </p>
                    <div className="contact-info">
                        <span className="contact-label">Email</span>
                        <p className="contact-detail">ink@juicyerror.com</p>
                    </div>
                    <div className="contact-info">
                        <span className="contact-label">Studio</span>
                        <p className="contact-detail">Private Studio, City, ST</p>
                    </div>
                    <div className="contact-info">
                        <span className="contact-label">Hours</span>
                        <p className="contact-detail">By Appointment Only</p>
                    </div>
                </div>

                <div className="contact-form-container">
                    {isSuccess ? (
                        <div className="form-success-message">
                            <h3>Request Sent</h3>
                            <p>Thank you for your inquiry. We'll be in touch shortly to discuss your project.</p>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setIsSuccess(false); setFormData({ name: '', email: '', idea: '', placement: '', date: '' }); }}
                            >
                                Send Another Request
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="contact-form">
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactSection;
