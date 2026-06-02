import React from 'react';
import { Bell } from 'lucide-react';

export default function AppHeader({ title = '마실', subtitle, showNotification = true, rightAction }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight font-heading leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {showNotification && (
            <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary active:scale-90 transition-all">
              <Bell className="w-[22px] h-[22px] text-foreground" strokeWidth={1.8} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full" />
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
}