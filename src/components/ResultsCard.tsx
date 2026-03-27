'use client';

import { Trophy } from '@/components/icons';
import { Button, Card, CardBody } from '@/components/ui';
import { useConfetti } from '@/hooks/useConfetti';
import type { ListRecords, WordItem } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

export interface ResultsCardProps {
  /**
   * Total number of words in the quiz
   */
  totalWords: number;
  /**
   * Total number of attempts made
   */
  totalTries: number;
  /**
   * Total time in milliseconds
   */
  totalTimeMs: number;
  /**
   * Words that were not resolved on first try
   */
  wordsNotFirstTry: WordItem[];
  /**
   * Previous personal best records (null if no records exist)
   */
  previousRecords: ListRecords | null;
  /**
   * Whether a new tries record was achieved
   */
  isNewTriesRecord: boolean;
  /**
   * Whether a new time record was achieved
   */
  isNewTimeRecord: boolean;
  /**
   * Callback when restart button is clicked
   */
  onRestart: () => void;
  /**
   * Callback when new list button is clicked
   */
  onNewList: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Format milliseconds to MM:SS string
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * ResultsCard Component
 *
 * Displays quiz results with performance metrics and personal records.
 *
 * Features:
 * - Total words, tries, and time display
 * - List of words that needed practice
 * - New record celebration with trophy icon
 * - Motivational messages
 * - Restart and new list buttons
 *
 * Example:
 * ```tsx
 * <ResultsCard
 *   totalWords={10}
 *   totalTries={12}
 *   totalTimeMs={45000}
 *   wordsNotFirstTry={[...]}
 *   previousRecords={{ bestTries: 15, bestTimeMs: 60000, updatedAt: Date.now() }}
 *   isNewTriesRecord={true}
 *   isNewTimeRecord={false}
 *   onRestart={() => router.push('/quiz')}
 *   onNewList={() => router.push('/')}
 * />
 * ```
 */
export function ResultsCard({
  totalWords,
  totalTries,
  totalTimeMs,
  wordsNotFirstTry,
  previousRecords,
  isNewTriesRecord,
  isNewTimeRecord,
  onRestart,
  onNewList,
  className = '',
}: ResultsCardProps) {
  const t = useTranslations('results');
  const { fireBurst } = useConfetti();
  const hasTriggeredConfetti = useRef(false);

  const hasNewRecord = isNewTriesRecord || isNewTimeRecord;
  const hasMistakes = wordsNotFirstTry.length > 0;

  // Trigger confetti celebration when there's a new record
  useEffect(() => {
    if (hasNewRecord && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      // Small delay to let the component render first
      const timer = setTimeout(() => {
        fireBurst();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hasNewRecord, fireBurst]);

  // Determine motivation message based on records
  const getMotivationMessage = (): string => {
    if (isNewTriesRecord && isNewTimeRecord) return t('motivationBoth');
    if (isNewTriesRecord) return t('motivationFewer');
    if (isNewTimeRecord) return t('motivationFaster');
    if (previousRecords) return t('motivationKeepGoing');
    return t('motivationFirst');
  };

  return (
    <Card className={`max-w-2xl w-full ${className}`}>
      <CardBody className="p-8 sm:p-12">
        {/* Title and Congratulations */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('congratulations')}</p>
        </div>

        {/* New Record Celebration */}
        {hasNewRecord && (
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Trophy size={40} className="animate-bounce" />
              <span className="text-2xl sm:text-3xl font-bold text-yellow-600">
                {t('newRecord')}
              </span>
              <Trophy size={40} className="animate-bounce" />
            </div>
            <div className="text-center space-y-1">
              {isNewTriesRecord && (
                <p className="text-lg text-yellow-700 font-medium">{t('newRecordTries')}</p>
              )}
              {isNewTimeRecord && (
                <p className="text-lg text-yellow-700 font-medium">{t('newRecordTime')}</p>
              )}
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="mb-8">
          <p className="text-lg text-gray-600 mb-4 text-center">{t('summary')}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Words */}
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <p className="text-sm text-primary-600 font-medium mb-1">{t('totalWords')}</p>
              <p className="text-3xl font-bold text-primary-700">{totalWords}</p>
            </div>

            {/* Total Tries */}
            <div className="bg-secondary-50 rounded-xl p-4 text-center">
              <p className="text-sm text-secondary-600 font-medium mb-1">{t('totalTries')}</p>
              <p className="text-3xl font-bold text-secondary-700">{totalTries}</p>
              {previousRecords?.bestTries !== undefined && (
                <p className="text-xs text-secondary-500 mt-1">
                  {isNewTriesRecord ? t('previousBest') : t('bestRecord')}: {previousRecords.bestTries}
                </p>
              )}
            </div>

            {/* Total Time */}
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-600 font-medium mb-1">{t('totalTime')}</p>
              <p className="text-3xl font-bold text-green-700">{formatTime(totalTimeMs)}</p>
              {previousRecords?.bestTimeMs !== undefined && (
                <p className="text-xs text-green-500 mt-1">
                  {isNewTimeRecord ? t('previousBest') : t('bestRecord')}: {formatTime(previousRecords.bestTimeMs)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Words Not First Try */}
        <div className="mb-8">
          {hasMistakes ? (
            <>
              <p className="text-lg text-gray-600 mb-3">{t('wordsNotFirstTry')}</p>
              <div className="bg-gray-50 rounded-xl p-4">
                <ul className="space-y-2">
                  {wordsNotFirstTry.map((word) => (
                    <li key={word.id} className="flex justify-between items-center text-gray-700">
                      <span className="font-medium">{word.prompt}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-primary-600">{word.answer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-lg text-green-700 font-medium">{t('noMistakes')}</p>
            </div>
          )}
        </div>

        {/* Motivation Message */}
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600 italic">{getMotivationMessage()}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="primary" size="lg" fullWidth onClick={onRestart}>
            {t('restart')}
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={onNewList}>
            {t('newList')}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
