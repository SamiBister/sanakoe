import Image from 'next/image';
import React from 'react';

export interface StarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the icon in pixels
   * @default 24
   */
  size?: number;
  /**
   * Accessible label for screen readers
   */
  ariaLabel?: string;
}

/**
 * Star icon component - used for correct answers and achievements
 *
 * Features:
 * - Kid-friendly bright gold color
 * - Scalable to any size
 * - Accessible with ARIA labels
 */
export const Star = React.forwardRef<HTMLDivElement, StarProps>(
  ({ size = 24, ariaLabel = 'Star', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center justify-center ${className}`}
        role="img"
        aria-label={ariaLabel}
        {...props}
      >
        <Image
          src="/icons/star.svg"
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size }}
          priority
        />
      </div>
    );
  },
);

Star.displayName = 'Star';
