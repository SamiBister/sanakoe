'use client';

import { PageTransition } from '@/components/PageTransition';
import { ResultsCard } from '@/components/ResultsCard';
import { useQuizStore } from '@/hooks/useQuizStore';
import { generateListFingerprint } from '@/lib/hash';
import { loadRecords, saveRecords } from '@/lib/storage';
import type { ListRecords } from '@/lib/types';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const restartQuiz = useQuizStore((state) => state.restartQuiz);
  const resetQuiz = useQuizStore((state) => state.resetQuiz);

  // Local state
  const isRestarting = useRef(false);
  // Snapshot of records as they existed BEFORE this run — captured once on mount.
  // Using a ref ensures the comparison value never changes mid-render even after
  // the save effect writes the new record back to localStorage.
  const previousRecordsSnapshot = useRef<ListRecords | null | undefined>(undefined);
  const [previousRecords, setPreviousRecords] = useState<ListRecords | null>(null);
  const [recordsSaved, setRecordsSaved] = useState(false);

  // Redirect to start if no completed session
  useEffect(() => {
    if (!isRestarting.current && (!session || !session.endTimeMs)) {
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

  // Load previous records once on mount, before any saving occurs.
  // The fingerprint is derived from session words which don't change while
  // the results page is shown, so running this only once is correct.
  useEffect(() => {
    if (!listFingerprint) return;
    if (previousRecordsSnapshot.current !== undefined) return; // already loaded

    try {
      const records = loadRecords();
      const listRecords = records[listFingerprint] ?? null;
      previousRecordsSnapshot.current = listRecords;
      setPreviousRecords(listRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
      previousRecordsSnapshot.current = null;
      setPreviousRecords(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFingerprint]);

  // Detect new records — compare against the pre-run snapshot, not the live
  // state, so saving the new record doesn't affect the comparison.
  const { isNewTriesRecord, isNewTimeRecord } = useMemo(() => {
    if (!results || !listFingerprint || previousRecordsSnapshot.current === undefined) {
      return { isNewTriesRecord: false, isNewTimeRecord: false };
    }

    const { totalTries, totalTimeMs } = results;
    const prev = previousRecordsSnapshot.current;

    // Check tries record
    const isNewTries = prev?.bestTries === undefined || totalTries < prev.bestTries;

    // Check time record (only if tries are equal or better)
    const isNewTime =
      prev?.bestTimeMs === undefined ||
      (totalTries <= (prev.bestTries ?? Infinity) && totalTimeMs < prev.bestTimeMs);

    return {
      isNewTriesRecord: isNewTries,
      isNewTimeRecord: isNewTime,
    };
  }, [results, previousRecords, listFingerprint]);

  // Save new records to localStorage (only once)
  useEffect(() => {
    if (!results || !listFingerprint || recordsSaved) return;
    // Wait until the previousRecords snapshot has been loaded
    if (previousRecordsSnapshot.current === undefined) return;

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
      isRestarting.current = true;
      restartQuiz();
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
          previousRecords={previousRecordsSnapshot.current ?? null}
          isNewTriesRecord={isNewTriesRecord}
          isNewTimeRecord={isNewTimeRecord}
          onRestart={handleRestart}
          onNewList={handleNewList}
        />
      </PageTransition>
    </main>
  );
}
