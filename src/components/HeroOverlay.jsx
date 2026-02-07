import React from 'react';
import './HeroOverlay.css';

const HeroOverlay = ({ onOpenReservation }) => {
    const handlePortfolioClick = () => {
        const workSection = document.getElementById('work');
        if (workSection) {
            workSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="hero-overlay">
            <div className="hero-content">
                <h2 className="hero-subtitle">Custom Tattoo Art</h2>
                <h1 className="hero-title">JuicyError</h1>
                <p className="hero-tagline">Ink with intention.</p>

                <div className="hero-buttons">
                    <button className="btn btn-primary" onClick={onOpenReservation}>Book Appointment</button>
                    <button className="btn btn-secondary" onClick={handlePortfolioClick}>View Portfolio</button>
                </div>
            </div>
        </div>
    );
};

export default HeroOverlay;
