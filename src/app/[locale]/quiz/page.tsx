'use client';

import { PageTransition } from '@/components/PageTransition';
import { PracticeCard } from '@/components/PracticeCard';
import { ProgressHeader } from '@/components/ProgressHeader';
import { QuizCard } from '@/components/QuizCard';
import { useQuizStore } from '@/hooks/useQuizStore';
import { matchAnswer } from '@/lib/answer-matcher';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type FeedbackState = 'none' | 'correct' | 'incorrect';

/**
 * Quiz Screen - Normal Mode
 *
 * Main quiz interface where users answer vocabulary questions.
 *
 * Features:
 * - Progress header showing resolved/total, tries, and timer
 * - Quiz card displaying current question
 * - Answer input with submit button
 * - Immediate feedback (correct/incorrect)
 * - Auto-advance after correct answer (1 second delay)
 * - Transition to practice mode on incorrect answer
 * - Navigation to results screen when quiz complete
 *
 * Flow:
 * 1. User sees current word prompt
 * 2. User types answer and submits
 * 3. System validates answer
 * 4. If correct: Show success feedback → submit to store → auto-advance
 * 5. If incorrect: Show correct answer → submit to store → practice mode
 * 6. When all words resolved: Navigate to results screen
 */
export default function QuizPage() {
  const router = useRouter();
  const locale = useLocale();

  // Quiz store state
  const session = useQuizStore((state) => state.session);
  const getCurrentWord = useQuizStore((state) => state.getCurrentWord);
  const getProgress = useQuizStore((state) => state.getProgress);
  const isQuizComplete = useQuizStore((state) => state.isQuizComplete);
  const submitAnswer = useQuizStore((state) => state.submitAnswer);
  const submitPracticeAnswer = useQuizStore((state) => state.submitPracticeAnswer);
  const exitPracticeMode = useQuizStore((state) => state.exitPracticeMode);
  const endQuiz = useQuizStore((state) => state.endQuiz);

  // Local state for feedback and UI
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);

  // Track previous word to detect changes
  const prevWordIdRef = useRef<string | null>(null);

  // Track if we've already navigated to results to prevent loops
  const hasNavigatedToResults = useRef(false);

  // Reset navigation flag when starting a new quiz (no words resolved yet)
  useEffect(() => {
    if (session && !session.words.some((w) => w.resolved)) {
      hasNavigatedToResults.current = false;
    }
  }, [session]);

  // Redirect to start if no active quiz
  useEffect(() => {
    if (!session) {
      router.push(`/${locale}`);
    }
  }, [session, router, locale]);

  // Check if quiz is complete and navigate to results
  // Compute completion from session data directly to avoid dependency issues
  const allWordsResolved = session?.words?.length ? session.words.every((w) => w.resolved) : false;

  useEffect(() => {
    if (session && allWordsResolved && !hasNavigatedToResults.current) {
      hasNavigatedToResults.current = true;
      endQuiz();
      router.push(`/${locale}/results`);
    }
  }, [session, allWordsResolved, endQuiz, router, locale]);

  // Reset feedback when word changes (only in normal mode)
  useEffect(() => {
    if (session?.mode !== 'normal') return;
    const currentWordId = session?.currentId;
    if (currentWordId && currentWordId !== prevWordIdRef.current) {
      setFeedback('none');
      setShowCorrectAnswer(undefined);
      setIsProcessing(false);
      prevWordIdRef.current = currentWordId;
    }
  }, [session?.mode, session?.currentId]);

  // Get current word and progress
  const currentWord = getCurrentWord();
  const progress = getProgress();

  // Handle answer submission
  const handleSubmit = (answer: string) => {
    if (!currentWord || isProcessing) return;

    setIsProcessing(true);

    // Check if answer is correct using answer matcher
    const isCorrect = matchAnswer(answer, currentWord.answer);

    if (isCorrect) {
      // Show correct feedback
      setFeedback('correct');
      setShowCorrectAnswer(undefined);

      // Submit to store and auto-advance after 1 second
      setTimeout(() => {
        submitAnswer(answer);
        // submitAnswer internally moves to next word, so feedback will reset via useEffect
      }, 1000);
    } else {
      // Show incorrect feedback with correct answer
      setFeedback('incorrect');
      setShowCorrectAnswer(currentWord.answer);

      // Submit to store (triggers practice mode) after 2 seconds
      setTimeout(() => {
        submitAnswer(answer);
        // submitAnswer internally handles practice mode transition
      }, 2000);
    }
  };

  // Handle practice mode answer submission
  const handlePracticeSubmit = (answer: string) => {
    submitPracticeAnswer(answer);
  };

  // Handle practice mode completion
  const handlePracticeComplete = () => {
    // Submit final practice answer and exit practice mode
    submitPracticeAnswer(practiceWord?.answer || '');
  };

  // Get the practice word if in practice mode
  const practiceWord = session?.practiceTarget
    ? session.words.find((w) => w.id === session.practiceTarget?.id)
    : null;

  // Show loading state if no session or current word
  if (!session || !currentWord) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Loading quiz...</h1>
        </div>
      </main>
    );
  }

  // Practice mode - calculate current repetition
  const totalPracticeReps = 3;
  const currentPracticeRep = session.practiceTarget
    ? totalPracticeReps - session.practiceTarget.remaining + 1
    : 1;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <PageTransition className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <ProgressHeader
            resolved={progress.resolved}
            total={progress.total}
            tries={session.tries}
            startTimeMs={session.startTimeMs}
          />
        </div>

        {/* Quiz Card or Practice Card based on mode */}
        <div className="flex justify-center">
          {session.mode === 'practice' && practiceWord ? (
            <PracticeCard
              prompt={practiceWord.prompt}
              correctAnswer={practiceWord.answer}
              currentRepetition={currentPracticeRep}
              totalRepetitions={totalPracticeReps}
              onSubmit={handlePracticeSubmit}
              onComplete={handlePracticeComplete}
            />
          ) : (
            <QuizCard
              prompt={currentWord.prompt}
              correctAnswer={showCorrectAnswer}
              onSubmit={handleSubmit}
              feedback={feedback}
              disabled={isProcessing}
            />
          )}
        </div>
      </PageTransition>
    </main>
  );
}
