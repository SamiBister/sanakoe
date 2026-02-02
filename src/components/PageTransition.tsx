'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition Component
 *
 * Wraps page content with a fade-in and slide animation for smooth transitions.
 * Respects prefers-reduced-motion automatically via CSS.
 *
 * @example
 * ```tsx
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure the component is mounted
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={`
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
