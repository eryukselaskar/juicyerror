import React from 'react';
import './HeroOverlay.css';

const HeroOverlay = () => {
    return (
        <div className="hero-overlay">
            <div className="hero-content">
                <h2 className="hero-subtitle">Custom Tattoo Art</h2>
                <h1 className="hero-title">JuicyError</h1>
                <p className="hero-tagline">Ink with intention.</p>

                <div className="hero-buttons">
                    <button className="btn btn-primary">Book Appointment</button>
                    <button className="btn btn-secondary">View Portfolio</button>
                </div>
            </div>
        </div>
    );
};

export default HeroOverlay;
