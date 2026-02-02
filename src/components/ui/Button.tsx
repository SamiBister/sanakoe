import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   * - primary: Bright, colorful (main actions)
   * - secondary: Outlined, less prominent
   * - danger: For destructive actions (with visual warning)
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * Kid-friendly button component with large text, rounded corners, and bright colors.
 * Designed for easy interaction with keyboard and mouse.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // Base styles for all buttons
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant styles
    const variantStyles = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-300 shadow-md hover:shadow-lg',
      secondary:
        'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-300',
      danger:
        'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 focus:ring-danger-300 shadow-md hover:shadow-lg',
    };

    // Size styles (kid-friendly - larger than typical)
    const sizeStyles = {
      sm: 'px-4 py-2 text-base',
      md: 'px-6 py-3 text-lg',
      lg: 'px-8 py-4 text-xl',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combine all styles
    const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

    return (
      <button ref={ref} className={buttonClasses} disabled={disabled || loading} {...props}>
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
