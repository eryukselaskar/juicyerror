import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HeroOverlay from './components/HeroOverlay';
import InkCanvas from './components/InkCanvas';
import WorkSection from './components/WorkSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import ReservationModal from './components/ReservationModal';
import './index.css';

function App() {
    const [isReservationOpen, setIsReservationOpen] = useState(false);

    const openReservation = () => setIsReservationOpen(true);
    const closeReservation = () => setIsReservationOpen(false);

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
            {/* Fixed Background */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
                <InkCanvas />
            </div>

            {/* Navigation - Fixed */}
            <Navigation />

            {/* Content Sections */}
            <main style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {/* Hero Section */}
                <section id="hero" style={{ height: '100vh', padding: 0, background: 'transparent', backdropFilter: 'none' }}>
                    <HeroOverlay onOpenReservation={openReservation} />
                </section>

                {/* Work Section */}
                <section id="work">
                    <WorkSection />
                </section>

                {/* About Section */}
                <section id="about">
                    <AboutSection />
                </section>

                {/* Contact Section */}
                <section id="contact">
                    <ContactSection />
                </section>
            </main>

            {/* Reservation Modal */}
            <ReservationModal isOpen={isReservationOpen} onClose={closeReservation} />
        </div>
    );
}

export default App;
