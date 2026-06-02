import React from 'react';

export default function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  multiline = false,
  rows = 4,
  maxLength,
  disabled = false,
}) {
  const inputClasses = `
    w-full px-4 py-3 rounded-input bg-secondary/50 border border-border
    text-foreground text-[15px] placeholder:text-muted-foreground/60
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
    transition-all disabled:opacity-50
  `;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          disabled={disabled}
          className={inputClasses}
        />
      )}
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
      {maxLength && value && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}