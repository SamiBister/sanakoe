/**
 * Timer Hook for Quiz
 *
 * Provides timer functionality for tracking quiz duration.
 * Updates every second and formats time as MM:SS.
 */

import { useEffect, useRef, useState } from 'react';

export interface TimerState {
  /** Elapsed time in seconds */
  elapsedSeconds: number;
  /** Formatted time string (MM:SS) */
  formattedTime: string;
  /** Whether timer is currently running */
  isRunning: boolean;
}

export interface TimerActions {
  /** Start or resume the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset timer to 0 and stop */
  reset: () => void;
}

export type UseTimerReturn = TimerState & TimerActions;

/**
 * Custom hook for managing a timer
 *
 * @returns Timer state and control functions
 *
 * @example
 * ```tsx
 * const { formattedTime, start, pause, reset } = useTimer();
 *
 * // Start timer when quiz begins
 * useEffect(() => {
 *   start();
 * }, []);
 *
 * // Display time
 * <div>Time: {formattedTime}</div>
 * ```
 */
export function useTimer(): UseTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start or resume the timer
   */
  const start = () => {
    setIsRunning(true);
  };

  /**
   * Pause the timer
   */
  const pause = () => {
    setIsRunning(false);
  };

  /**
   * Reset timer to 0 and stop
   */
  const reset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
  };

  /**
   * Format seconds as MM:SS
   */
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Effect to manage interval when timer is running
  useEffect(() => {
    if (isRunning) {
      // Start interval
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      // Clear interval when paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when isRunning changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isRunning,
    start,
    pause,
    reset,
  };
}
