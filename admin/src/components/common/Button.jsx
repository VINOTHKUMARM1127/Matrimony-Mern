import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  onClick,
  isLoading,
  loading,
  disabled,
  type = 'button',
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth,
  icon: Icon,
}) => {
  const busy = isLoading || loading;

  const base =
    'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
    'transition-all duration-200 ease-out select-none ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary:
      'text-white bg-gradient-to-br from-primary-500 to-primary-600 ' +
      'shadow-[0_4px_14px_-4px_rgba(219,39,72,0.5)] hover:shadow-[0_6px_20px_-4px_rgba(219,39,72,0.6)] ' +
      'hover:-translate-y-0.5',
    outline:
      'border border-neutral-200 bg-white text-neutral-700 ' +
      'hover:bg-neutral-50 hover:border-neutral-300 shadow-sm',
    ghost: 'text-neutral-600 hover:bg-neutral-100',
    danger:
      'text-white bg-gradient-to-br from-error-500 to-error-600 ' +
      'shadow-[0_4px_14px_-4px_rgba(220,38,38,0.5)] hover:shadow-[0_6px_20px_-4px_rgba(220,38,38,0.6)] ' +
      'hover:-translate-y-0.5',
    gold:
      'text-white bg-gradient-to-br from-gold-500 to-gold-600 ' +
      'shadow-[0_4px_14px_-4px_rgba(184,148,31,0.5)] hover:-translate-y-0.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {busy ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 18} />
      )}
      {children}
    </button>
  );
};

export default Button;
