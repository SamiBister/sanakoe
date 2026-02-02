// Unmock the useConfetti hook since we want to test the actual implementation
jest.unmock('@/hooks/useConfetti');

import { act, renderHook, waitFor } from '@testing-library/react';
import { useConfetti } from '../useConfetti';

// Mock canvas-confetti module
const mockConfetti = jest.fn();
mockConfetti.reset = jest.fn();

jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: mockConfetti,
}));

// Mock matchMedia for reduced motion tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('useConfetti', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchMedia(false); // Default: no reduced motion preference
  });

  describe('fireConfetti', () => {
    it('should fire confetti with default options', async () => {
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireConfetti();
      });

      await waitFor(() => {
        expect(mockConfetti).toHaveBeenCalledTimes(1);
      });

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
        }),
      );
    });

    it('should fire confetti with custom options', async () => {
      const { result } = renderHook(() =>
        useConfetti({
          particleCount: 50,
          spread: 100,
        }),
      );

      await act(async () => {
        await result.current.fireConfetti();
      });

      await waitFor(() => {
        expect(mockConfetti).toHaveBeenCalledTimes(1);
      });

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 50,
          spread: 100,
        }),
      );
    });

    it('should allow overriding options in fireConfetti call', async () => {
      const { result } = renderHook(() =>
        useConfetti({
          particleCount: 100,
        }),
      );

      await act(async () => {
        await result.current.fireConfetti({ particleCount: 200 });
      });

      await waitFor(() => {
        expect(mockConfetti).toHaveBeenCalledTimes(1);
      });

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 200,
        }),
      );
    });
  });

  describe('fireBurst', () => {
    it('should fire burst pattern with multiple confetti calls', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireBurst();
      });

      // Initial calls from left and right
      expect(mockConfetti).toHaveBeenCalledTimes(2);

      // First call from left
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 50,
          angle: 60,
          origin: { x: 0, y: 0.6 },
        }),
      );

      // Second call from right
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 50,
          angle: 120,
          origin: { x: 1, y: 0.6 },
        }),
      );

      // Advance timer for center burst
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockConfetti).toHaveBeenCalledTimes(3);

      // Third call from center
      expect(mockConfetti).toHaveBeenLastCalledWith(
        expect.objectContaining({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
        }),
      );

      jest.useRealTimers();
    });
  });

  describe('prefers-reduced-motion', () => {
    it('should not fire confetti when reduced motion is preferred', async () => {
      mockMatchMedia(true);

      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireConfetti();
      });

      expect(mockConfetti).not.toHaveBeenCalled();
    });

    it('should not fire burst when reduced motion is preferred', async () => {
      mockMatchMedia(true);

      const { result } = renderHook(() => useConfetti());

      await act(async () => {
        await result.current.fireBurst();
      });

      expect(mockConfetti).not.toHaveBeenCalled();
    });

    it('should fire confetti when respectReducedMotion is false', async () => {
      mockMatchMedia(true);

      const { result } = renderHook(() => useConfetti({ respectReducedMotion: false }));

      await act(async () => {
        await result.current.fireConfetti();
      });

      await waitFor(() => {
        expect(mockConfetti).toHaveBeenCalledTimes(1);
      });
    });

    it('should return correct isReducedMotion value', () => {
      mockMatchMedia(true);

      const { result } = renderHook(() => useConfetti());

      expect(result.current.isReducedMotion()).toBe(true);
    });
  });

  describe('custom colors', () => {
    it('should use custom colors', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      const { result } = renderHook(() => useConfetti({ colors: customColors }));

      await act(async () => {
        await result.current.fireConfetti();
      });

      await waitFor(() => {
        expect(mockConfetti).toHaveBeenCalledTimes(1);
      });

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: customColors,
        }),
      );
    });
  });
});
