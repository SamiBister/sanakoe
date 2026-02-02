'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Configuration options for the confetti animation
 */
export interface ConfettiOptions {
  /**
   * Number of confetti particles (default: 100)
   */
  particleCount?: number;
  /**
   * Spread angle in degrees (default: 70)
   */
  spread?: number;
  /**
   * Origin x position (0-1, default: 0.5)
   */
  originX?: number;
  /**
   * Origin y position (0-1, default: 0.6)
   */
  originY?: number;
  /**
   * Array of hex colors for confetti
   */
  colors?: string[];
  /**
   * Gravity value (default: 1)
   */
  gravity?: number;
  /**
   * Whether to disable for reduced motion preference
   */
  respectReducedMotion?: boolean;
}

const DEFAULT_OPTIONS: ConfettiOptions = {
  particleCount: 100,
  spread: 70,
  originX: 0.5,
  originY: 0.6,
  colors: ['#f59e0b', '#14b8a6', '#ef4444', '#8b5cf6', '#22c55e', '#ec4899'],
  gravity: 1,
  respectReducedMotion: true,
};

/**
 * Hook to trigger confetti celebrations
 *
 * Features:
 * - Lazy loads canvas-confetti for performance
 * - Respects prefers-reduced-motion by default
 * - Provides multiple confetti patterns (basic, burst, cannon)
 * - Auto-cleans up on unmount
 *
 * @example
 * ```tsx
 * const { fireConfetti, fireBurst } = useConfetti();
 *
 * // Trigger on new record
 * useEffect(() => {
 *   if (isNewRecord) {
 *     fireBurst();
 *   }
 * }, [isNewRecord]);
 * ```
 */
export function useConfetti(options: ConfettiOptions = {}) {
  // Use 'any' for the confetti function since the types are complex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const confettiRef = useRef<any>(null);
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    if (!mergedOptions.respectReducedMotion) return false;
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [mergedOptions.respectReducedMotion]);

  // Lazy load confetti
  const loadConfetti = useCallback(async () => {
    if (confettiRef.current) return confettiRef.current;

    try {
      const confettiModule = await import('canvas-confetti');
      confettiRef.current = confettiModule.default;
      return confettiRef.current;
    } catch (error) {
      console.warn('Failed to load canvas-confetti:', error);
      return null;
    }
  }, []);

  // Basic confetti fire
  const fireConfetti = useCallback(
    async (customOptions: Partial<ConfettiOptions> = {}) => {
      if (prefersReducedMotion()) return;

      const confetti = await loadConfetti();
      if (!confetti) return;

      const opts = { ...mergedOptions, ...customOptions };

      confetti({
        particleCount: opts.particleCount,
        spread: opts.spread,
        origin: { x: opts.originX!, y: opts.originY! },
        colors: opts.colors,
        gravity: opts.gravity,
      });
    },
    [loadConfetti, mergedOptions, prefersReducedMotion],
  );

  // Burst pattern - confetti from multiple directions
  const fireBurst = useCallback(async () => {
    if (prefersReducedMotion()) return;

    const confetti = await loadConfetti();
    if (!confetti) return;

    const { colors, gravity } = mergedOptions;

    // Fire from left
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
      gravity,
    });

    // Fire from right
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
      gravity,
    });

    // Fire from center after a small delay
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors,
        gravity,
      });
    }, 200);
  }, [loadConfetti, mergedOptions, prefersReducedMotion]);

  // Cannon pattern - rapid fire from center
  const fireCannon = useCallback(async () => {
    if (prefersReducedMotion()) return;

    const confetti = await loadConfetti();
    if (!confetti) return;

    const { colors, gravity } = mergedOptions;
    const duration = 1500;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = Math.floor(30 * (timeLeft / duration));

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
        colors,
        gravity,
      });
    }, 150);
  }, [loadConfetti, mergedOptions, prefersReducedMotion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (confettiRef.current) {
        // Reset confetti canvas
        confettiRef.current.reset?.();
      }
    };
  }, []);

  return {
    fireConfetti,
    fireBurst,
    fireCannon,
    isReducedMotion: prefersReducedMotion,
  };
}
