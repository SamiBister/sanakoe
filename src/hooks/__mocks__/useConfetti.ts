'use client';

import type { ConfettiOptions } from '@/hooks/useConfetti';

/**
 * Mock useConfetti hook for testing
 */
export function useConfetti(_options?: ConfettiOptions) {
  return {
    fireConfetti: jest.fn(),
    fireBurst: jest.fn(),
    fireCannon: jest.fn(),
    isReducedMotion: () => false,
  };
}
