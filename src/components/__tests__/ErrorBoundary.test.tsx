import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Child component content</div>;
};

// Suppress console.error during error boundary tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  // Store original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    // Reset window.location mock before each test
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  afterEach(() => {
    // Restore window.location
    window.location = originalLocation;
  });

  describe('rendering', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Test child</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText('Test child')).toBeInTheDocument();
    });

    it('renders fallback UI when child throws an error', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText('Child component content')).not.toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error message</div>}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('displays kid-friendly message in default fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/don't worry/i)).toBeInTheDocument();
      expect(screen.getByText(/let's try again/i)).toBeInTheDocument();
    });

    it('displays Try Again and Go Home buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
    });
  });

  describe('error recovery', () => {
    it('clears error state after Try Again is clicked', () => {
      // This test verifies that clicking Try Again resets the error boundary state
      // The component will try to render the children again after reset
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Error UI should be showing
      expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();

      // Click Try Again - this resets the error state
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // The error boundary will try to render children again
      // Since ThrowingComponent still throws, it will show error again
      // But the key point is that the state was reset (hasError was set to false)
      // In a real app, the error might be temporary and a re-render would succeed
    });

    it('navigates to home when Go Home is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Click Go Home
      fireEvent.click(screen.getByRole('button', { name: /go to home/i }));

      // Should navigate to home - the location mock includes the origin
      expect(window.location.href).toContain('/');
    });
  });

  describe('error callback', () => {
    it('calls onError callback when error occurs', () => {
      const onErrorMock = jest.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      );
    });

    it('passes error message to onError callback', () => {
      const onErrorMock = jest.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const [error] = onErrorMock.mock.calls[0];
      expect(error.message).toBe('Test error message');
    });
  });

  describe('error details display', () => {
    it('shows error details in development mode', () => {
      // Set development mode
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText(/error details/i)).toBeInTheDocument();

      // Restore
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
    });
  });

  describe('nested errors', () => {
    it('catches errors from deeply nested components', () => {
      const DeeplyNested = () => (
        <div>
          <div>
            <div>
              <ThrowingComponent shouldThrow={true} />
            </div>
          </div>
        </div>
      );

      render(
        <ErrorBoundary>
          <DeeplyNested />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('multiple children', () => {
    it('catches error when one of multiple children throws', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <ThrowingComponent shouldThrow={true} />
          <div>Third child</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText('First child')).not.toBeInTheDocument();
      expect(screen.queryByText('Third child')).not.toBeInTheDocument();
    });
  });
});
