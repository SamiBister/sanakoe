// Unmock PageTransition so we can test the actual implementation
jest.unmock('@/components/PageTransition');

import { render, screen, waitFor } from '@testing-library/react';
import { PageTransition } from '../PageTransition';

// Mock requestAnimationFrame for controlled testing
const mockRequestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  callback(0);
  return 1;
});
const mockCancelAnimationFrame = jest.fn();

describe('PageTransition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.requestAnimationFrame = mockRequestAnimationFrame;
    window.cancelAnimationFrame = mockCancelAnimationFrame;
  });

  it('should render children', async () => {
    render(
      <PageTransition>
        <div data-testid="child">Test Content</div>
      </PageTransition>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply transition classes', async () => {
    render(
      <PageTransition>
        <span>Content</span>
      </PageTransition>,
    );

    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper).toHaveClass('transition-all');
    expect(wrapper).toHaveClass('duration-300');
    expect(wrapper).toHaveClass('ease-out');
  });

  it('should start with hidden state and become visible', async () => {
    render(
      <PageTransition>
        <span>Animated Content</span>
      </PageTransition>,
    );

    const wrapper = screen.getByText('Animated Content').parentElement;

    // After requestAnimationFrame is called, element should be visible
    await waitFor(() => {
      expect(wrapper).toHaveClass('opacity-100');
      expect(wrapper).toHaveClass('translate-y-0');
    });
  });

  it('should accept custom className', () => {
    render(
      <PageTransition className="custom-class">
        <span>Custom Class Content</span>
      </PageTransition>,
    );

    const wrapper = screen.getByText('Custom Class Content').parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should cleanup animation frame on unmount', () => {
    const { unmount } = render(
      <PageTransition>
        <span>Cleanup Test</span>
      </PageTransition>,
    );

    unmount();

    // The cancelAnimationFrame should be called with the returned ID
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('should render multiple children', () => {
    render(
      <PageTransition>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </PageTransition>,
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });

  it('should work with complex nested content', () => {
    render(
      <PageTransition>
        <div>
          <h1>Title</h1>
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </div>
        </div>
      </PageTransition>,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });
});
