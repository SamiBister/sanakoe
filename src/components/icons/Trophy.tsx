import React from "react";
import Image from "next/image";

export interface TrophyProps extends React.HTMLAttributes<HTMLDivElement> {
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
 * Trophy icon component - used for records and achievements
 *
 * Features:
 * - Kid-friendly bright orange/yellow color
 * - Scalable to any size
 * - Accessible with ARIA labels
 */
export const Trophy = React.forwardRef<HTMLDivElement, TrophyProps>(
  ({ size = 24, ariaLabel = "Trophy", className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center justify-center ${className}`}
        role="img"
        aria-label={ariaLabel}
        {...props}
      >
        <Image
          src="/icons/trophy.svg"
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size }}
          priority
        />
      </div>
    );
  }
);

Trophy.displayName = "Trophy";
