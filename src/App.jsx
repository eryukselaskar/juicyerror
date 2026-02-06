import React from 'react';
import Navigation from './components/Navigation';
import HeroOverlay from './components/HeroOverlay';
import InkCanvas from './components/InkCanvas';

function App() {
    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Navigation />
            <HeroOverlay />
            <InkCanvas />
        </div>
    );
}

export default App;
