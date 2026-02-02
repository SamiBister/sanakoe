import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant style
   * - default: Standard white card with shadow
   * - outlined: Card with border, no shadow
   * - elevated: Card with larger shadow
   */
  variant?: 'default' | 'outlined' | 'elevated';
  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Whether the card is hoverable (adds hover effect)
   */
  hoverable?: boolean;
}

/**
 * Kid-friendly card component with rounded corners and shadow.
 * Used to group related content visually.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', padding = 'md', hoverable = false, className = '', children, ...props },
    ref,
  ) => {
    // Base styles for all cards
    const baseStyles = 'rounded-2xl transition-all duration-200';

    // Variant styles
    const variantStyles = {
      default: 'bg-white shadow-md',
      outlined: 'bg-white border-2 border-gray-200',
      elevated: 'bg-white shadow-xl',
    };

    // Padding styles (kid-friendly - generous padding)
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    // Hover styles
    const hoverStyles = hoverable ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';

    // Combine all styles
    const cardClasses = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`;

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

/**
 * Card Header - for card titles and actions
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional action element (e.g., button, icon)
   */
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ action, className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`flex items-center justify-between mb-4 ${className}`} {...props}>
        <div className="font-bold text-xl text-gray-800">{children}</div>
        {action && <div>{action}</div>}
      </div>
    );
  },
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Body - for main card content
 */
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`text-gray-700 ${className}`} {...props}>
        {children}
      </div>
    );
  },
);

CardBody.displayName = 'CardBody';

/**
 * Card Footer - for card actions or additional info
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
        {children}
      </div>
    );
  },
);

CardFooter.displayName = 'CardFooter';
