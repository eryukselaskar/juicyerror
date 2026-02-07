import React from 'react';
import './Sections.css';

const ContactSection = () => {
    return (
        <div className="section-container">
            <h2 className="section-title">Contact & Booking</h2>
            <div className="contact-container">
                <p className="about-text">
                    Ready to start your project?
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
        </div>
    );
};

export default ContactSection;
