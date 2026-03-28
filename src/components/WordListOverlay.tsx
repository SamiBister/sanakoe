'use client';

import { useQuizStore } from '@/hooks/useQuizStore';
import type { WordItem } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

/**
 * Filter options for the word list
 */
type FilterOption = 'all' | 'unresolved' | 'mistakes';

export interface WordListOverlayProps {
  /**
   * Optional words to display (useful for testing or standalone usage)
   * If not provided, will use words from quiz store
   */
  words?: WordItem[];
  /**
   * Optional current word ID for highlighting (useful for testing)
   * If not provided, will use currentId from quiz store
   */
  currentWordId?: string | null;
}

/**
 * List icon SVG component
 */
const ListIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/**
 * Get status emoji for a word item
 */
const getStatusEmoji = (word: WordItem): string => {
  if (word.resolved) {
    return '✅'; // Resolved (correct on any attempt)
  }
  if (word.firstTryFailed) {
    return '⚠️'; // Mistake made (wrong on first try)
  }
  return '🔁'; // Unresolved (not yet answered correctly)
};

/**
 * Get status key for translation
 */
const getStatusKey = (word: WordItem): 'resolved' | 'unresolved' | 'mistake' => {
  if (word.resolved) {
    return 'resolved';
  }
  if (word.firstTryFailed) {
    return 'mistake';
  }
  return 'unresolved';
};

/**
 * Global Word List Overlay Component
 *
 * Displays all vocabulary words with their status indicators.
 * Accessible from any screen during the quiz.
 *
 * Features:
 * - Shows all words with prompt → answer
 * - Status indicators: ✅ Resolved, 🔁 Unresolved, ⚠️ Mistake made
 * - Highlights current word during active quiz
 * - Filter options: All / Unresolved / Mistakes
 * - Keyboard accessible (ESC to close)
 * - Does not affect quiz state or timer
 */
export const WordListOverlay: React.FC<WordListOverlayProps> = ({
  words: propWords,
  currentWordId: propCurrentWordId,
}) => {
  const t = useTranslations('wordList');
  const tCommon = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterOption>('all');

  // Get words and current ID from store if not provided as props
  const session = useQuizStore((state) => state.session);
  const words = propWords ?? session?.words ?? [];
  const currentWordId = propCurrentWordId ?? session?.currentId ?? null;

  // Determine if quiz is active (has started and not ended)
  const isQuizActive = useMemo(() => {
    return session !== null && session.startTimeMs > 0 && !session.endTimeMs;
  }, [session]);

  // Filter words based on selected filter
  const filteredWords = useMemo(() => {
    switch (filter) {
      case 'unresolved':
        return words.filter((word) => !word.resolved);
      case 'mistakes':
        return words.filter((word) => word.firstTryFailed);
      case 'all':
      default:
        return words;
    }
  }, [words, filter]);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleExport = useCallback(() => {
    // Build CSV from the full word list (all words, not just filtered)
    const rows = words.map((word) => {
      const status = word.resolved
        ? t('status.resolved')
        : word.firstTryFailed
          ? t('status.mistake')
          : t('status.unresolved');
      // Wrap fields in quotes to handle commas inside values
      const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
      return `${escape(word.prompt)},${escape(word.answer)},${escape(status)}`;
    });

    const header = `${t('columnWord')},${t('columnTranslation')},${t('columnStatus')}`;
    const csv = [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sanakoe.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [words, t]);

  // Don't render button if no words loaded
  if (words.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating button - positioned in top-right corner */}
      <button
        onClick={handleOpen}
        className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[44px] bg-white text-primary-600 border-2 border-primary-500 rounded-full shadow-lg hover:bg-primary-50 hover:shadow-xl active:bg-primary-100 focus:outline-none focus:ring-4 focus:ring-primary-300 focus:ring-offset-2 transition-all duration-200"
        aria-label={t('button')}
      >
        <ListIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-semibold text-sm sm:text-base">{t('button')}</span>
      </button>

      {/* Modal Overlay */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('title')}
        size="lg"
        closeOnEsc={true}
        closeOnOverlayClick={true}
        footer={
          <div className="flex justify-between items-center">
            <Button variant="secondary" onClick={handleExport}>
              ⬇️ {t('export')}
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              {tCommon('close')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group" aria-label="Filter options">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-sm sm:text-base font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={filter === 'all'}
            >
              {t('filter.all')} ({words.length})
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-sm sm:text-base font-medium transition-colors ${
                filter === 'unresolved'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={filter === 'unresolved'}
            >
              🔁 {t('filter.unresolved')} ({words.filter((w) => !w.resolved).length})
            </button>
            <button
              onClick={() => setFilter('mistakes')}
              className={`px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-sm sm:text-base font-medium transition-colors ${
                filter === 'mistakes'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={filter === 'mistakes'}
            >
              ⚠️ {t('filter.mistakes')} ({words.filter((w) => w.firstTryFailed).length})
            </button>
          </div>

          {/* Word list table */}
          {filteredWords.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full" role="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                    >
                      {t('columnStatus')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                    >
                      {t('columnWord')}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                    >
                      {t('columnTranslation')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWords.map((word) => {
                    const isCurrent = isQuizActive && word.id === currentWordId;
                    const statusEmoji = getStatusEmoji(word);
                    const statusKey = getStatusKey(word);

                    return (
                      <tr
                        key={word.id}
                        className={`${
                          isCurrent
                            ? 'bg-primary-100 border-l-4 border-l-primary-500'
                            : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="text-lg"
                            title={t(`status.${statusKey}`)}
                            aria-label={t(`status.${statusKey}`)}
                          >
                            {statusEmoji}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">
                            {word.prompt}
                            {isCurrent && (
                              <span className="ml-2 text-sm text-primary-600 font-normal">
                                {t('current')}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{word.answer}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2">
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span>{t('status.resolved')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔁</span>
              <span>{t('status.unresolved')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚠️</span>
              <span>{t('status.mistake')}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
