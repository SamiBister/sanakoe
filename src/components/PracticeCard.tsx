'use client';

import { Button, Card, CardBody, Input } from '@/components/ui';
import { useTranslations } from 'next-intl';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

type PracticeState = 'typing' | 'success';

export interface PracticeCardProps {
  /**
   * The word prompt being practiced
   */
  prompt: string;
  /**
   * The correct answer to practice typing
   */
  correctAnswer: string;
  /**
   * Current repetition (1-3)
   */
  currentRepetition: number;
  /**
   * Total repetitions required
   */
  totalRepetitions: number;
  /**
   * Callback when a practice answer is submitted
   */
  onSubmit: (answer: string) => void;
  /**
   * Callback when practice is complete (after all 3 repetitions)
   */
  onComplete: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PracticeCard Component
 *
 * Displays practice mode for words answered incorrectly.
 * User must type the correct answer 3 times to practice.
 *
 * Features:
 * - Shows the correct answer prominently
 * - Counter shows progress (1/3, 2/3, 3/3)
 * - Input auto-focused
 * - Encouraging feedback after each correct entry
 * - Celebratory message after final repetition
 * - Animation transitions between states
 *
 * Example:
 * ```tsx
 * <PracticeCard
 *   prompt="hello"
 *   correctAnswer="hei"
 *   currentRepetition={2}
 *   totalRepetitions={3}
 *   onSubmit={handlePracticeSubmit}
 *   onComplete={handlePracticeComplete}
 * />
 * ```
 */
export function PracticeCard({
  prompt,
  correctAnswer,
  currentRepetition,
  totalRepetitions,
  onSubmit,
  onComplete,
  className = '',
}: PracticeCardProps) {
  const t = useTranslations('practice');
  const tQuiz = useTranslations('quiz');
  const [answer, setAnswer] = useState('');
  const [practiceState, setPracticeState] = useState<PracticeState>('typing');
  const [showFeedback, setShowFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when component mounts or state resets
  useEffect(() => {
    if (practiceState === 'typing') {
      inputRef.current?.focus();
    }
  }, [practiceState, currentRepetition]);

  // Get encouragement message based on current repetition
  const getEncouragementMessage = (): string => {
    // Show progressively more enthusiastic messages
    if (currentRepetition === 1) {
      return t('keepGoing');
    } else if (currentRepetition === 2) {
      return t('good');
    } else {
      return t('excellent');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const trimmedAnswer = answer.trim();

    // Check if answer matches (case-insensitive)
    const isCorrect = trimmedAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
      // Show success feedback
      setShowFeedback(true);

      // Determine if this is the last repetition
      const isLastRepetition = currentRepetition === totalRepetitions;

      if (isLastRepetition) {
        // Show completion state
        setPracticeState('success');
        // Delay before calling onComplete to show success message
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        // Submit and prepare for next repetition
        onSubmit(trimmedAnswer);
        // Clear input and feedback after brief delay
        setTimeout(() => {
          setAnswer('');
          setShowFeedback(false);
          inputRef.current?.focus();
        }, 500);
      }
    } else {
      // Incorrect - shake the input (visual feedback)
      inputRef.current?.classList.add('animate-shake');
      setTimeout(() => {
        inputRef.current?.classList.remove('animate-shake');
      }, 500);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && answer.trim()) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  // Calculate completed repetitions (for display)
  const completedReps = currentRepetition - 1;

  return (
    <Card className={`max-w-2xl w-full ${className}`}>
      <CardBody className="p-8 sm:p-12">
        {/* Practice Mode Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-lg font-semibold mb-4">
            <span className="mr-2">📝</span>
            {t('title')}
          </div>
        </div>

        {/* Success State - After 3rd correct answer */}
        {practiceState === 'success' && (
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <span className="text-6xl animate-bounce">🌟</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">{t('wellDone')}</h2>
          </div>
        )}

        {/* Typing State - Practice input */}
        {practiceState === 'typing' && (
          <>
            {/* Instruction */}
            <p className="text-center text-gray-600 mb-4">{t('instruction')}</p>

            {/* Prompt (optional but helpful for context) */}
            <div className="text-center mb-4">
              <span className="text-lg text-gray-500">{prompt}</span>
            </div>

            {/* Correct Answer Display */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6 mb-6">
              <p className="text-sm text-purple-600 mb-2 font-medium">{t('correctAnswerLabel')}</p>
              <p className="text-4xl sm:text-5xl font-bold text-purple-700 text-center">
                {correctAnswer}
              </p>
            </div>

            {/* Progress Counter */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                {Array.from({ length: totalRepetitions }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index < completedReps
                        ? 'bg-green-500 scale-110'
                        : index === completedReps
                          ? 'bg-purple-500 animate-pulse'
                          : 'bg-gray-300'
                    }`}
                    aria-label={
                      index < completedReps
                        ? 'Completed'
                        : index === completedReps
                          ? 'Current'
                          : 'Remaining'
                    }
                  />
                ))}
                <span className="ml-3 text-lg font-semibold text-gray-600">
                  {t('counter', {
                    current: currentRepetition,
                    total: totalRepetitions,
                  })}
                </span>
              </div>
            </div>

            {/* Encouragement Feedback */}
            {showFeedback && (
              <div className="text-center mb-4 animate-fade-in">
                <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                  ✓ {getEncouragementMessage()}
                </span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  id="practice-input"
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('typeHere')}
                  inputSize="lg"
                  className="text-center text-2xl"
                  autoComplete="off"
                  aria-label={t('typeHere')}
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!answer.trim()}
                  className="text-xl py-5 px-10 min-w-[180px] bg-purple-600 hover:bg-purple-700"
                >
                  {tQuiz('checkButton')}
                </Button>
              </div>
            </form>
          </>
        )}
      </CardBody>
    </Card>
  );
}
