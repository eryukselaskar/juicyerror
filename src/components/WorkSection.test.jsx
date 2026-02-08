import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WorkSection from './WorkSection';

describe('WorkSection', () => {
  it('renders without crashing and displays the section title', () => {
    render(<WorkSection />);
    expect(screen.getByText('Selected Work')).toBeInTheDocument();
  });

  it('renders the correct number of work items', () => {
    const { container } = render(<WorkSection />);
    const workItems = container.getElementsByClassName('work-item');
    expect(workItems.length).toBe(6);
  });

  it('displays the correct title and category for each work item', () => {
    render(<WorkSection />);

    const expectedWorks = [
        { title: 'Geometric Flow', category: 'Blackwork' },
        { title: "Nature's Breath", category: 'Illustrative' },
        { title: 'Abstract Lines', category: 'Fine Line' },
        { title: 'Dark Matter', category: 'Abstract' },
        { title: 'Sacred Forms', category: 'Geometric' },
        { title: 'Fluid Motion', category: 'Custom' }
    ];

    expectedWorks.forEach(work => {
        expect(screen.getByText(work.title)).toBeInTheDocument();
        expect(screen.getByText(work.category)).toBeInTheDocument();
    });
  });
});
