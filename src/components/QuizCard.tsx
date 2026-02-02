'use client';

import { Star } from '@/components/icons';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { useTranslations } from 'next-intl';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

type FeedbackState = 'none' | 'correct' | 'incorrect';

export interface QuizCardProps {
  /**
   * The word prompt to translate
   */
  prompt: string;
  /**
   * Correct answer (shown when answer is incorrect)
   */
  correctAnswer?: string;
  /**
   * Callback when answer is submitted
   */
  onSubmit: (answer: string) => void;
  /**
   * Current feedback state
   */
  feedback: FeedbackState;
  /**
   * Disabled state (e.g., during auto-advance delay)
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * QuizCard Component
 *
 * Displays a vocabulary quiz question with input field and submit button.
 *
 * Features:
 * - Large, kid-friendly text and buttons
 * - Auto-focus on input field
 * - Enter key submits answer
 * - Visual feedback for correct/incorrect answers
 * - Shows correct answer when incorrect
 * - Animated star icon for correct answers
 * - Input clears after each submission
 *
 * Feedback States:
 * - 'none': Normal question display
 * - 'correct': Show success message with star animation
 * - 'incorrect': Show correct answer and encouraging message
 *
 * Example:
 * ```tsx
 * <QuizCard
 *   prompt="hello"
 *   correctAnswer="hei"
 *   onSubmit={handleSubmit}
 *   feedback="incorrect"
 * />
 * ```
 */
export function QuizCard({
  prompt,
  correctAnswer,
  onSubmit,
  feedback,
  disabled = false,
  className = '',
}: QuizCardProps) {
  const t = useTranslations('quiz');
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when component mounts or feedback resets
  useEffect(() => {
    if (feedback === 'none' && !disabled) {
      inputRef.current?.focus();
    }
  }, [feedback, disabled]);

  // Clear input when feedback changes to correct/incorrect
  useEffect(() => {
    if (feedback !== 'none') {
      setAnswer('');
    }
  }, [feedback]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !disabled) {
      onSubmit(answer.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && answer.trim() && !disabled) {
      e.preventDefault();
      onSubmit(answer.trim());
    }
  };

  // Get random feedback message
  const getRandomFeedback = (type: 'correct' | 'incorrect'): string => {
    const messages =
      type === 'correct'
        ? ['great', 'wellDone', 'perfect', 'excellent', 'awesome', 'amazing']
        : ['notQuite', 'tryAgain', 'almostThere', 'keepGoing'];

    const randomIndex = Math.floor(Math.random() * messages.length);
    return t(`${type}.${messages[randomIndex]}`);
  };

  return (
    <Card className={`max-w-2xl w-full ${className}`}>
      <CardBody className="p-8 sm:p-12">
        {/* Feedback: Correct Answer */}
        {feedback === 'correct' && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <Star className="w-20 h-20 text-yellow-400 animate-scale-in" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
              {getRandomFeedback('correct')}
            </h2>
          </div>
        )}

        {/* Feedback: Incorrect Answer */}
        {feedback === 'incorrect' && correctAnswer && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-4">
              {getRandomFeedback('incorrect')}
            </h2>
            <div className="bg-orange-50 rounded-xl p-6 mb-4">
              <p className="text-lg text-gray-700 mb-2">{t('correctAnswerIs')}</p>
              <p className="text-3xl sm:text-4xl font-bold text-orange-600">{correctAnswer}</p>
            </div>
          </div>
        )}

        {/* Question */}
        {feedback === 'none' && (
          <>
            <div className="text-center mb-8">
              <label htmlFor="answer-input" className="block text-lg text-gray-600 mb-3">
                {t('promptLabel')}
              </label>
              <h2 className="text-4xl sm:text-5xl font-bold text-primary-600 mb-6">{prompt}</h2>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  id="answer-input"
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('yourAnswer')}
                  disabled={disabled}
                  inputSize="lg"
                  className="text-center text-2xl"
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!answer.trim() || disabled}
                  className="text-2xl py-6 px-12 min-w-[200px]"
                >
                  {t('submit')}
                </Button>
              </div>
            </form>
          </>
        )}
      </CardBody>
    </Card>
  );
}
