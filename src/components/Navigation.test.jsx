import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navigation from './Navigation';

// Mock scrollIntoView since it's not available in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Navigation', () => {
    it('renders the navigation component', () => {
        render(<Navigation />);
        expect(screen.getByText('JuicyError')).toBeInTheDocument();
    });

    it('initial state has menu closed', () => {
        const { container } = render(<Navigation />);
        const toggle = container.querySelector('.nav-toggle');
        const menu = container.querySelector('.nav-menu');

        expect(toggle).not.toHaveClass('open');
        expect(menu).not.toHaveClass('open');
    });

    it('toggles menu open on click', () => {
        const { container } = render(<Navigation />);
        const toggle = container.querySelector('.nav-toggle');
        const menu = container.querySelector('.nav-menu');

        fireEvent.click(toggle);

        expect(toggle).toHaveClass('open');
        expect(menu).toHaveClass('open');
    });

    it('toggles menu closed on second click', () => {
        const { container } = render(<Navigation />);
        const toggle = container.querySelector('.nav-toggle');
        const menu = container.querySelector('.nav-menu');

        // Open
        fireEvent.click(toggle);
        expect(toggle).toHaveClass('open');

        // Close
        fireEvent.click(toggle);
        expect(toggle).not.toHaveClass('open');
        expect(menu).not.toHaveClass('open');
    });

    it('closes menu when a link is clicked', () => {
        const { container } = render(<Navigation />);
        const toggle = container.querySelector('.nav-toggle');
        const menu = container.querySelector('.nav-menu');
        const link = screen.getByText('Work');

        // Open menu first
        fireEvent.click(toggle);
        expect(menu).toHaveClass('open');

        // Click link
        fireEvent.click(link);

        // Should be closed
        expect(menu).not.toHaveClass('open');
        expect(toggle).not.toHaveClass('open');
    });
});
