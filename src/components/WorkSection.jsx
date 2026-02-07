import React from 'react';
import './Sections.css';

const WorkSection = () => {
    // Placeholder array for work items
    const works = Array.from({ length: 6 });

    return (
        <div className="section-container">
            <h2 className="section-title">Selected Work</h2>
            <div className="work-grid">
                {works.map((_, i) => (
                    <div className="work-item" key={i}>
                        <div className="work-placeholder">
                            Work {i + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkSection;
