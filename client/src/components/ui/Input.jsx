import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helpText,
      className = '',
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-brand-charcoal mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            block w-full px-4 py-3
            bg-white border-2 rounded-2xl
            text-brand-charcoal placeholder:text-brand-charcoal/40
            transition-all duration-150 ease-out
            focus:border-brand-pink focus:ring-brand-pink
            disabled:bg-brand-charcoal/5 disabled:cursor-not-allowed
            ${error ? 'border-error' : 'border-brand-charcoal/10'}
            ${className}
          `.trim()}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="mt-1.5 text-sm text-brand-charcoal/50">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

