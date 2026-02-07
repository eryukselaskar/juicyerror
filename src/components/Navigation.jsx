import React from 'react';
import './Navigation.css';

const Navigation = () => {
    const handleNavClick = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="nav-container">
            <div className="nav-logo" onClick={(e) => handleNavClick(e, 'hero')} style={{cursor: 'pointer'}}>JuicyError</div>
            <div className="nav-menu">
                <a href="#work" className="nav-link" onClick={(e) => handleNavClick(e, 'work')}>Work</a>
                <a href="#about" className="nav-link" onClick={(e) => handleNavClick(e, 'about')}>About</a>
                <a href="#contact" className="nav-link" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
            </div>
        </nav>
    );
};

export default Navigation;
