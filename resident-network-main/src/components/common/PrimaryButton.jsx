import React from 'react';

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  variant = 'primary',
  size = 'md',
  icon,
}) {
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'bg-transparent text-foreground border border-border hover:bg-secondary',
    ghost: 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-[15px]',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-button font-semibold
        transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
}