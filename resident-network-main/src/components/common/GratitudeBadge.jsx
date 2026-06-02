import React from 'react';

const gratitudeConfig = {
  yes:  '감사비용 있어요',
  no:   '감사비용 없어요',
  give: '드려요',
};

export default function GratitudeBadge({ amount }) {
  if (!amount) return null;

  const label = gratitudeConfig[amount]
    ?? (typeof amount === 'number' ? `감사비용 ${amount.toLocaleString()}원` : amount);

  return (
    <span className="inline-flex items-center text-[12px] font-semibold px-3 py-1 rounded-badge bg-accent/10 text-accent">
      {label}
    </span>
  );
}