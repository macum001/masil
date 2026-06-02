import React from 'react';

const statusConfig = {
  waiting:    { label: '대기중',  color: 'text-muted-foreground bg-secondary' },
  connecting: { label: '연결중',  color: 'text-accent bg-accent/10' },
  done:       { label: '완료',    color: 'text-muted-foreground bg-secondary' },
  closed:     { label: '마감',    color: 'text-muted-foreground bg-secondary' },
  open:       { label: '모집중',  color: 'text-primary bg-primary/10' },
  inProgress: { label: '진행중',  color: 'text-accent bg-accent/10' },
  urgent:     { label: '급해요',  color: 'text-destructive bg-destructive/10' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-badge ${config.color}`}>
      {config.label}
    </span>
  );
}