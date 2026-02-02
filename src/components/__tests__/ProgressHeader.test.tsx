/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { ProgressHeader } from '../ProgressHeader';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    const translations: Record<string, string> = {
      progress: `${values?.resolved} / ${values?.total}`,
      tries: 'Tries',
      time: 'Time',
    };
    return translations[key] || key;
  },
}));

describe('ProgressHeader', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('Progress Display', () => {
    it('should display resolved and total words correctly', () => {
      render(<ProgressHeader resolved={3} total={10} tries={0} startTimeMs={Date.now()} />);

      expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('should display 0 progress at start', () => {
      render(<ProgressHeader resolved={0} total={5} tries={0} startTimeMs={Date.now()} />);

      expect(screen.getByText('0 / 5')).toBeInTheDocument();
    });

    it('should display completed progress', () => {
      render(<ProgressHeader resolved={10} total={10} tries={0} startTimeMs={Date.now()} />);

      expect(screen.getByText('10 / 10')).toBeInTheDocument();
    });
  });

  describe('Tries Counter', () => {
    it('should display tries counter', () => {
      render(<ProgressHeader resolved={0} total={5} tries={0} startTimeMs={Date.now()} />);

      expect(screen.getByText(/Tries/)).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display non-zero tries', () => {
      render(<ProgressHeader resolved={3} total={10} tries={5} startTimeMs={Date.now()} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display large tries count', () => {
      render(<ProgressHeader resolved={5} total={10} tries={23} startTimeMs={Date.now()} />);

      expect(screen.getByText('23')).toBeInTheDocument();
    });
  });

  describe('Timer Display', () => {
    it('should display initial time 00:00', () => {
      const now = Date.now();
      render(<ProgressHeader resolved={0} total={5} tries={0} startTimeMs={now} />);

      expect(screen.getByText(/Time/)).toBeInTheDocument();
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('should display elapsed time in MM:SS format', () => {
      const now = Date.now();
      const startTime = now - 90000; // 1 minute 30 seconds ago

      render(<ProgressHeader resolved={0} total={5} tries={0} startTimeMs={startTime} />);

      expect(screen.getByText('01:30')).toBeInTheDocument();
    });

    it('should update timer every second', () => {
      const now = Date.now();
      jest.setSystemTime(now);

      render(<ProgressHeader resolved={0} total={5} tries={0} startTimeMs={now} />);

      // Initial: 00:00
      expect(screen.getByText('00:00')).toBeInTheDocument();

      // Advance 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:01')).toBeInTheDocument();

      // Advance another second
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:02')).toBeInTheDocument();

      // Advance to 10 seconds
      act(() => {
        jest.advanceTimersByTime(8000);
      });
      expect(screen.getByText('00:10')).toBeInTheDocument();
    });

    it('should display double-digit minutes correctly', () => {
      const now = Date.now();
      const startTime = now - 615000; // 10 minutes 15 seconds ago

      render(<ProgressHeader resolved={0} total={5} tries={0} startTimeMs={startTime} />);

      expect(screen.getByText('10:15')).toBeInTheDocument();
    });

    it('should pad single-digit seconds with zero', () => {
      const now = Date.now();
      const startTime = now - 125000; // 2 minutes 5 seconds ago

      render(<ProgressHeader resolved={0} total={5} tries={0} startTimeMs={startTime} />);

      expect(screen.getByText('02:05')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should render with default classes', () => {
      const { container } = render(
        <ProgressHeader resolved={0} total={5} tries={0} startTimeMs={Date.now()} />,
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('flex', 'flex-wrap', 'items-center');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ProgressHeader
          resolved={0}
          total={5}
          tries={0}
          startTimeMs={Date.now()}
          className="custom-class"
        />,
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('custom-class');
    });

    it('should render dividers between sections', () => {
      const { container } = render(
        <ProgressHeader resolved={0} total={5} tries={0} startTimeMs={Date.now()} />,
      );

      // Look for divider elements with bg-gray-300 class
      const dividers = container.querySelectorAll('.bg-gray-300');
      // Should have 2 dividers (between progress/tries and tries/time)
      expect(dividers).toHaveLength(2);
    });
  });

  describe('Timer Cleanup', () => {
    it('should clean up timer on unmount', () => {
      const { unmount } = render(
        <ProgressHeader resolved={0} total={5} tries={0} startTimeMs={Date.now()} />,
      );

      // Verify timer is running
      expect(jest.getTimerCount()).toBeGreaterThan(0);

      // Unmount component
      unmount();

      // All timers should be cleared
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with responsive layout', () => {
      const { container } = render(
        <ProgressHeader resolved={0} total={5} tries={0} startTimeMs={Date.now()} />,
      );

      // Check that component has flex-wrap class for responsive design
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('flex-wrap');
    });
  });
});
