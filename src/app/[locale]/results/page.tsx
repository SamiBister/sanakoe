'use client';

import { PageTransition } from '@/components/PageTransition';
import { ResultsCard } from '@/components/ResultsCard';
import { useQuizStore } from '@/hooks/useQuizStore';
import { generateListFingerprint } from '@/lib/hash';
import { loadRecords, saveRecords } from '@/lib/storage';
import type { ListRecords, WordItem } from '@/lib/types';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

/**
 * Results Screen
 *
 * Displays quiz results with performance metrics and personal records.
 *
 * Features:
 * - Total words, tries, and time display
 * - List of words that needed practice (not first try)
 * - Personal best record detection and celebration
 * - Save new records to localStorage
 * - Restart quiz (same words, reshuffled)
 * - New word list navigation
 *
 * Record Detection:
 * - New best tries: current tries < previous best tries
 * - New best time: current time < previous best time (only if tries equal)
 *
 * Flow:
 * 1. Load completed session from store
 * 2. Calculate results metrics
 * 3. Load previous records from localStorage
 * 4. Compare and detect new records
 * 5. Save new records if achieved
 * 6. Display results with celebration
 * 7. Handle restart or new list navigation
 */
export default function ResultsPage() {
  const router = useRouter();
  const locale = useLocale();

  // Quiz store state
  const session = useQuizStore((state) => state.session);
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const resetQuiz = useQuizStore((state) => state.resetQuiz);

  // Local state
  const [previousRecords, setPreviousRecords] = useState<ListRecords | null>(null);
  const [recordsSaved, setRecordsSaved] = useState(false);

  // Redirect to start if no completed session
  useEffect(() => {
    if (!session || !session.endTimeMs) {
      router.push(`/${locale}`);
    }
  }, [session, router, locale]);

  // Calculate quiz results
  const results = useMemo(() => {
    if (!session || !session.endTimeMs) {
      return null;
    }

    const totalWords = session.words.length;
    const totalTries = session.tries;
    const totalTimeMs = session.endTimeMs - session.startTimeMs;
    const wordsNotFirstTry = session.words.filter((word) => word.firstTryFailed);

    return {
      totalWords,
      totalTries,
      totalTimeMs,
      wordsNotFirstTry,
    };
  }, [session]);

  // Generate fingerprint for record lookup
  const listFingerprint = useMemo(() => {
    if (!session) return null;
    return generateListFingerprint(session.words);
  }, [session]);

  // Load previous records
  useEffect(() => {
    if (!listFingerprint) return;

    try {
      const records = loadRecords();
      const listRecords = records[listFingerprint] || null;
      setPreviousRecords(listRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
      setPreviousRecords(null);
    }
  }, [listFingerprint]);

  // Detect new records
  const { isNewTriesRecord, isNewTimeRecord } = useMemo(() => {
    if (!results || !listFingerprint) {
      return { isNewTriesRecord: false, isNewTimeRecord: false };
    }

    const { totalTries, totalTimeMs } = results;

    // Check tries record
    const isNewTries =
      previousRecords?.bestTries === undefined || totalTries < previousRecords.bestTries;

    // Check time record (only if tries are equal or better)
    const isNewTime =
      previousRecords?.bestTimeMs === undefined ||
      (totalTries <= (previousRecords.bestTries ?? Infinity) &&
        totalTimeMs < previousRecords.bestTimeMs);

    return {
      isNewTriesRecord: isNewTries,
      isNewTimeRecord: isNewTime,
    };
  }, [results, previousRecords, listFingerprint]);

  // Save new records to localStorage (only once)
  useEffect(() => {
    if (!results || !listFingerprint || recordsSaved) return;

    // Only save if there's a new record or no previous records
    if (!isNewTriesRecord && !isNewTimeRecord && previousRecords) return;

    const { totalTries, totalTimeMs } = results;

    try {
      const records = loadRecords();
      const existingRecord = records[listFingerprint];

      // Determine new best values
      const newRecord: ListRecords = {
        bestTries: isNewTriesRecord ? totalTries : (existingRecord?.bestTries ?? totalTries),
        bestTimeMs: isNewTimeRecord ? totalTimeMs : (existingRecord?.bestTimeMs ?? totalTimeMs),
        updatedAt: Date.now(),
      };

      // Save updated records
      saveRecords({
        ...records,
        [listFingerprint]: newRecord,
      });

      setRecordsSaved(true);
    } catch (error) {
      console.error('Failed to save records:', error);
    }
  }, [results, listFingerprint, isNewTriesRecord, isNewTimeRecord, previousRecords, recordsSaved]);

  // Handle restart quiz (same words, reshuffled)
  const handleRestart = () => {
    if (session) {
      // Reset words to initial state but keep the same words
      const resetWords: WordItem[] = session.words.map((word) => ({
        ...word,
        attempts: 0,
        firstTryFailed: false,
        resolved: false,
      }));

      // Use the loadWords action to reset and then start
      useQuizStore.getState().loadWords(resetWords);
      startQuiz();
      router.push(`/${locale}/quiz`);
    }
  };

  // Handle new word list
  const handleNewList = () => {
    resetQuiz();
    router.push(`/${locale}`);
  };

  // Show loading state
  if (!session || !results) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Loading results...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <PageTransition>
        <ResultsCard
          totalWords={results.totalWords}
          totalTries={results.totalTries}
          totalTimeMs={results.totalTimeMs}
          wordsNotFirstTry={results.wordsNotFirstTry}
          previousRecords={previousRecords}
          isNewTriesRecord={isNewTriesRecord}
          isNewTimeRecord={isNewTimeRecord}
          onRestart={handleRestart}
          onNewList={handleNewList}
        />
      </PageTransition>
    </main>
  );
}
