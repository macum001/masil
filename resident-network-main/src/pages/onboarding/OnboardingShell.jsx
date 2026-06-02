import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function OnboardingShell({ step, totalSteps, title, onBack, children }) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-background">
      {/* Header */}
      <div className="flex-shrink-0">
        {/* Progress bar */}
        <div className="h-1 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Nav */}
        <div className="flex items-center gap-3 px-5 py-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-secondary active:scale-90 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">{step} / {totalSteps}</p>
            <h2 className="text-lg font-bold text-foreground leading-tight font-heading mt-0.5">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}