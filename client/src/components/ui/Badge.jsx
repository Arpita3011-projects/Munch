const variants = {
  default: 'bg-brand-charcoal/10 text-brand-charcoal',
  pink: 'bg-brand-pink/15 text-brand-pink-dark',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  rainbow: 'bg-gradient-to-r from-accent-rainbow-0 to-accent-rainbow-5 text-white',
};

function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1
        text-xs font-semibold
        rounded-full
        ${variants[variant] || variants.default}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;

