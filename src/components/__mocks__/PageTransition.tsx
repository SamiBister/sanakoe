'use client';

import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Mock PageTransition for testing - just renders children
 */
export function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>;
}
