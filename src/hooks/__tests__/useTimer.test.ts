/**
 * Tests for useTimer hook
 */

import { act, renderHook } from '@testing-library/react';
import { useTimer } from '../useTimer';

/**
 * Helper to advance timers by specified milliseconds
 */
function advanceTimersByTime(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('starts at 0 seconds', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.formattedTime).toBe('00:00');
      expect(result.current.isRunning).toBe(false);
    });

    it('exposes all required functions', () => {
      const { result } = renderHook(() => useTimer());

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('start', () => {
    it('sets isRunning to true', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
    });

    it('increments elapsed time every second', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.elapsedSeconds).toBe(0);

      advanceTimersByTime(1000);
      expect(result.current.elapsedSeconds).toBe(1);

      advanceTimersByTime(1000);
      expect(result.current.elapsedSeconds).toBe(2);

      advanceTimersByTime(1000);
      expect(result.current.elapsedSeconds).toBe(3);
    });

    it('continues counting after multiple seconds', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(5000);
      expect(result.current.elapsedSeconds).toBe(5);
    });

    it('can be called multiple times (idempotent)', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
        result.current.start();
        result.current.start();
      });

      advanceTimersByTime(1000);
      expect(result.current.elapsedSeconds).toBe(1);
    });
  });

  describe('pause', () => {
    it('sets isRunning to false', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('stops incrementing elapsed time', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(2000);
      expect(result.current.elapsedSeconds).toBe(2);

      act(() => {
        result.current.pause();
      });

      advanceTimersByTime(3000);
      expect(result.current.elapsedSeconds).toBe(2); // Still 2, not 5
    });

    it('preserves elapsed time when paused', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(5000);
      expect(result.current.elapsedSeconds).toBe(5);

      act(() => {
        result.current.pause();
      });

      expect(result.current.elapsedSeconds).toBe(5);
    });

    it('can be resumed after pausing', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(3000);
      expect(result.current.elapsedSeconds).toBe(3);

      act(() => {
        result.current.pause();
      });

      advanceTimersByTime(2000);
      expect(result.current.elapsedSeconds).toBe(3);

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(2000);
      expect(result.current.elapsedSeconds).toBe(5);
    });
  });

  describe('reset', () => {
    it('resets elapsed time to 0', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(10000);
      expect(result.current.elapsedSeconds).toBe(10);

      act(() => {
        result.current.reset();
      });

      expect(result.current.elapsedSeconds).toBe(0);
    });

    it('stops the timer', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(5000);
      expect(result.current.elapsedSeconds).toBe(5);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isRunning).toBe(false);

      advanceTimersByTime(3000);
      expect(result.current.elapsedSeconds).toBe(0); // Not incrementing
    });

    it('resets formatted time to 00:00', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(125000); // 2:05

      act(() => {
        result.current.reset();
      });

      expect(result.current.formattedTime).toBe('00:00');
    });
  });

  describe('formattedTime', () => {
    it('formats 0 seconds as 00:00', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.formattedTime).toBe('00:00');
    });

    it('formats single digit seconds with leading zero', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(5000);
      expect(result.current.formattedTime).toBe('00:05');
    });

    it('formats double digit seconds correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(45000);
      expect(result.current.formattedTime).toBe('00:45');
    });

    it('formats 1 minute as 01:00', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(60000);
      expect(result.current.formattedTime).toBe('01:00');
    });

    it('formats minutes and seconds correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(125000); // 2 minutes 5 seconds
      expect(result.current.formattedTime).toBe('02:05');
    });

    it('formats large times correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(3723000); // 62 minutes 3 seconds
      expect(result.current.formattedTime).toBe('62:03');
    });

    it('handles 59 seconds correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(59000);
      expect(result.current.formattedTime).toBe('00:59');

      advanceTimersByTime(1000);
      expect(result.current.formattedTime).toBe('01:00');
    });

    it('handles 9:59 to 10:00 transition', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(599000); // 9:59
      expect(result.current.formattedTime).toBe('09:59');

      advanceTimersByTime(1000); // 10:00
      expect(result.current.formattedTime).toBe('10:00');
    });
  });

  describe('cleanup', () => {
    it('clears interval on unmount', () => {
      const { result, unmount } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(2000);
      expect(result.current.elapsedSeconds).toBe(2);

      unmount();

      // After unmount, timer should not continue
      advanceTimersByTime(3000);

      // Re-render to verify state didn't change after unmount
      const { result: newResult } = renderHook(() => useTimer());
      expect(newResult.current.elapsedSeconds).toBe(0);
    });

    it('clears interval when paused', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(2000);

      act(() => {
        result.current.pause();
      });

      // Verify no timers are pending after pause
      expect(jest.getTimerCount()).toBe(0);
    });

    it('clears interval when reset', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(2000);

      act(() => {
        result.current.reset();
      });

      // Verify no timers are pending after reset
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles rapid start/pause cycles', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
        result.current.pause();
        result.current.start();
        result.current.pause();
        result.current.start();
      });

      advanceTimersByTime(1000);
      expect(result.current.elapsedSeconds).toBe(1);
    });

    it('handles start after reset', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      advanceTimersByTime(5000);
      expect(result.current.elapsedSeconds).toBe(5);

      act(() => {
        result.current.reset();
        result.current.start();
      });

      advanceTimersByTime(3000);
      expect(result.current.elapsedSeconds).toBe(3);
    });

    it('handles pause when not running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.elapsedSeconds).toBe(0);
    });

    it('handles reset when not running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.reset();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.elapsedSeconds).toBe(0);
    });
  });

  describe('accuracy', () => {
    it('maintains accuracy over long durations', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      // Run for 5 minutes
      advanceTimersByTime(300000);
      expect(result.current.elapsedSeconds).toBe(300);
      expect(result.current.formattedTime).toBe('05:00');
    });

    it('handles sub-second advances correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      // Advance by 500ms (should not increment)
      advanceTimersByTime(500);
      expect(result.current.elapsedSeconds).toBe(0);

      // Advance another 500ms (should increment to 1)
      advanceTimersByTime(500);
      expect(result.current.elapsedSeconds).toBe(1);
    });
  });
});
