import React from 'react';

export default function CategoryChip({ label, isActive = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-4 py-2 rounded-chip text-[14px] font-medium
        whitespace-nowrap transition-all active:scale-95
        ${isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-muted-foreground'
        }
      `}
      style={isActive
        ? { boxShadow: '0 4px 12px rgba(93,123,111,0.25)' }
        : { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
      }
    >
      {label}
    </button>
  );
}