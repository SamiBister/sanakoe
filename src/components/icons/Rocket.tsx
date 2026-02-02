import Image from 'next/image';
import React from 'react';

export interface RocketProps extends React.HTMLAttributes<HTMLDivElement> {
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
 * Rocket icon component - used for motivation and encouragement
 *
 * Features:
 * - Kid-friendly bright colors (red and teal)
 * - Scalable to any size
 * - Accessible with ARIA labels
 */
export const Rocket = React.forwardRef<HTMLDivElement, RocketProps>(
  ({ size = 24, ariaLabel = 'Rocket', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center justify-center ${className}`}
        role="img"
        aria-label={ariaLabel}
        {...props}
      >
        <Image
          src="/icons/rocket.svg"
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

Rocket.displayName = 'Rocket';
