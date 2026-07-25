import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-brand-pink text-white hover:bg-brand-pink-dark active:bg-brand-pink-dark disabled:bg-brand-pink/50',
  secondary:
    'bg-brand-charcoal text-white hover:bg-brand-charcoal/90 active:bg-brand-charcoal/80 disabled:bg-brand-charcoal/50',
  ghost:
    'bg-transparent text-brand-charcoal hover:bg-brand-charcoal/5 active:bg-brand-charcoal/10 disabled:text-brand-charcoal/40',
  outline:
    'border-2 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white active:bg-brand-pink-dark active:border-brand-pink-dark disabled:border-brand-pink/30 disabled:text-brand-pink/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      className = '',
      loading = false,
      disabled = false,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          font-display font-semibold
          rounded-full
          transition-all duration-150 ease-out
          focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2
          disabled:cursor-not-allowed
          min-h-[44px]
          ${variants[variant] || variants.primary}
          ${sizes[size] || sizes.md}
          ${loading ? 'cursor-wait' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 h-5 w-5"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

