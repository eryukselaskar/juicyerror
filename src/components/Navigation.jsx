import React from 'react';
import './Navigation.css';

const Navigation = () => {
    return (
        <nav className="nav-container">
            <div className="nav-logo">JuicyError</div>
            <div className="nav-menu">
                <a href="#" className="nav-link">Work</a>
                <a href="#" className="nav-link">About</a>
                <a href="#" className="nav-link">Contact</a>
            </div>
        </nav>
    );
};

export default Navigation;
