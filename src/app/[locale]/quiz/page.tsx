'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Quiz Screen - Placeholder
 *
 * This is a temporary placeholder for the quiz screen.
 * Full implementation will be done in Task 6.2 and 6.3.
 *
 * For now, this just shows a message and allows returning to start screen.
 */
export default function QuizPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 2 seconds
    const timeout = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary-600">🎯 Quiz Starting...</h1>
        <p className="text-xl text-gray-700 mb-4">Quiz screen will be implemented in Task 6.2</p>
        <p className="text-lg text-gray-600">Redirecting back to start screen...</p>
      </div>
    </main>
  );
}
