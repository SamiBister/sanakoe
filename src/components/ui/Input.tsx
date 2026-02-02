import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input label
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text to display below input
   */
  helperText?: string;
  /**
   * Whether the input is in error state
   */
  isError?: boolean;
  /**
   * Input size
   */
  inputSize?: 'md' | 'lg';
  /**
   * Full width input
   */
  fullWidth?: boolean;
}

/**
 * Kid-friendly input component with large text, clear focus states, and rounded corners.
 * Designed for easy typing and clear visual feedback.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isError = false,
      inputSize = 'lg',
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${React.useId()}`;
    const hasError = isError || !!error;

    // Base input styles
    const baseStyles =
      'block rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100';

    // Size styles (kid-friendly - large text)
    const sizeStyles = {
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    // State styles
    const stateStyles = hasError
      ? 'border-danger-500 focus:border-danger-600 focus:ring-danger-200 text-danger-900'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200 text-gray-900';

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combine all styles
    const inputClasses = `${baseStyles} ${sizeStyles[inputSize]} ${stateStyles} ${widthStyles} ${className}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block mb-2 font-semibold text-base text-gray-700">
            {label}
          </label>
        )}

        {/* Input */}
        <input ref={ref} id={inputId} className={inputClasses} {...props} />

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-danger-600 flex items-center" role="alert">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && <p className="mt-2 text-sm text-gray-600">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

/**
 * Textarea component - similar styling to Input
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Textarea label
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text to display below textarea
   */
  helperText?: string;
  /**
   * Whether the textarea is in error state
   */
  isError?: boolean;
  /**
   * Full width textarea
   */
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      isError = false,
      fullWidth = false,
      className = '',
      id,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    // Generate unique ID if not provided
    const textareaId = id || `textarea-${React.useId()}`;
    const hasError = isError || !!error;

    // Base textarea styles
    const baseStyles =
      'block rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 px-5 py-3 text-lg';

    // State styles
    const stateStyles = hasError
      ? 'border-danger-500 focus:border-danger-600 focus:ring-danger-200 text-danger-900'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200 text-gray-900';

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combine all styles
    const textareaClasses = `${baseStyles} ${stateStyles} ${widthStyles} ${className}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label htmlFor={textareaId} className="block mb-2 font-semibold text-base text-gray-700">
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea ref={ref} id={textareaId} rows={rows} className={textareaClasses} {...props} />

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-danger-600 flex items-center" role="alert">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && <p className="mt-2 text-sm text-gray-600">{helperText}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
