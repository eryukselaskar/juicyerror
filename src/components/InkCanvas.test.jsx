import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InkCanvas from './InkCanvas';

// Mock Canvas to check its props and avoid rendering children (InkMesh) which needs context
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: ({ children, ...props }) => {
      return <div data-testid="mock-canvas" data-props={JSON.stringify(props)} />;
    },
  };
});

describe('InkCanvas', () => {
  it('passes the correct dpr to Canvas', () => {
    const { getByTestId } = render(<InkCanvas />);
    const canvas = getByTestId('mock-canvas');
    const props = JSON.parse(canvas.getAttribute('data-props'));

    // Baseline: expect [1, 2] currently
    expect(props.dpr).toEqual([1, 1.5]);
  });
});
