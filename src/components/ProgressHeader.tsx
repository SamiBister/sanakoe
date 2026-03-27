'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export interface ProgressHeaderProps {
  /**
   * Number of words resolved (answered correctly at least once)
   */
  resolved: number;
  /**
   * Total number of words in the quiz
   */
  total: number;
  /**
   * Total number of tries (attempts in normal mode only)
   */
  tries: number;
  /**
   * Quiz start time in milliseconds (for timer)
   */
  startTimeMs: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ProgressHeader Component
 *
 * Displays quiz progress information at the top of the quiz screen:
 * - Progress (resolved / total words)
 * - Total tries (attempts in normal mode)
 * - Elapsed time (MM:SS format)
 *
 * Features:
 * - Real-time timer updates
 * - Kid-friendly styling with large text
 * - Responsive layout
 * - Localized labels
 *
 * Example:
 * ```tsx
 * <ProgressHeader
 *   resolved={5}
 *   total={10}
 *   tries={7}
 *   startTimeMs={Date.now() - 60000}
 * />
 * ```
 */
export function ProgressHeader({
  resolved,
  total,
  tries,
  startTimeMs,
  className = '',
}: ProgressHeaderProps) {
  const t = useTranslations('quiz');
  const [elapsedMs, setElapsedMs] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    const updateElapsed = () => {
      setElapsedMs(Date.now() - startTimeMs);
    };

    // Initial update
    updateElapsed();

    // Update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTimeMs]);

  // Format elapsed time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-6 sm:gap-8 p-4 bg-white rounded-2xl shadow-md ${className}`}
    >
      {/* Progress */}
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-lg font-medium">
          {t('progress', { resolved, total })}
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gray-300" />

      {/* Tries */}
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-lg font-medium">
          {t('tries', { count: tries })}
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gray-300" />

      {/* Timer */}
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-lg font-medium">
          {t('time')}: <span className="font-bold text-primary-600">{formatTime(elapsedMs)}</span>
        </span>
      </div>
    </div>
  );
}
