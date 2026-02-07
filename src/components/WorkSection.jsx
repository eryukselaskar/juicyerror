import React from 'react';
import './Sections.css';

const WorkSection = () => {
    // Enhanced placeholder data
    const works = [
        { id: 1, title: 'Geometric Flow', category: 'Blackwork' },
        { id: 2, title: 'Nature\'s Breath', category: 'Illustrative' },
        { id: 3, title: 'Abstract Lines', category: 'Fine Line' },
        { id: 4, title: 'Dark Matter', category: 'Abstract' },
        { id: 5, title: 'Sacred Forms', category: 'Geometric' },
        { id: 6, title: 'Fluid Motion', category: 'Custom' }
    ];

    return (
        <div className="section-container">
            <h2 className="section-title">Selected Work</h2>
            <div className="work-grid">
                {works.map((work) => (
                    <div className="work-item" key={work.id}>
                        <div className="work-content">
                            <h3 className="work-title">{work.title}</h3>
                            <span className="work-category">{work.category}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkSection;
