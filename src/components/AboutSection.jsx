import React from 'react';
import './Sections.css';

const AboutSection = () => {
    return (
        <div className="section-container">
            <h2 className="section-title">About the Artist</h2>
            <div className="about-content">
                <p className="about-text">
                    <span className="about-highlight">JuicyError</span> is a tattoo artist specializing in abstract blackwork and illustrative styles.
                </p>
                <p className="about-text">
                    With a background in fine arts and digital design, the work explores the intersection of organic forms and geometric precision.
                    Every piece is designed with intention, flowing with the body's natural lines to create something truly unique and permanent.
                </p>
                <p className="about-text">
                    Based in a private studio, focusing on creating a comfortable and safe environment for every client.
                </p>
            </div>
        </div>
    );
};

export default AboutSection;
