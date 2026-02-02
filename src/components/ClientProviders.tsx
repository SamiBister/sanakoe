'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WordListOverlay } from '@/components/WordListOverlay';
import { ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper
 *
 * Wraps the application with:
 * - ErrorBoundary for React error handling
 * - WordListOverlay for global word list access
 *
 * This component must be a client component to use Error Boundary
 * and handle client-side state.
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <WordListOverlay />
      {children}
    </ErrorBoundary>
  );
}
