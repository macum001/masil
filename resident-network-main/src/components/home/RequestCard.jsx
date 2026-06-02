import React from 'react';
import StatusBadge from '../common/StatusBadge';
import GratitudeBadge from '../common/GratitudeBadge';
import { MapPin, Clock } from 'lucide-react';

export default function RequestCard({ post, onClick }) {
  return (
    <article
      onClick={onClick}
      className="bg-card rounded-card p-5 active:scale-[0.98] transition-all cursor-pointer"
      style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        {post.category && (
          <span className="text-[12px] font-semibold text-primary tracking-wide uppercase">
            {post.category}
          </span>
        )}
        {post.status && <StatusBadge status={post.status} />}
      </div>

      <h3 className="text-[15px] font-semibold text-foreground leading-snug line-clamp-2 mb-2 tracking-tight">
        {post.title}
      </h3>

      <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
        {post.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" strokeWidth={1.5} />
            {post.location}
          </span>
        )}
        {post.timeAgo && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            {post.timeAgo}
          </span>
        )}
      </div>

      {post.gratitude && (
        <div className="mt-3">
          <GratitudeBadge amount={post.gratitude} />
        </div>
      )}
    </article>
  );
}