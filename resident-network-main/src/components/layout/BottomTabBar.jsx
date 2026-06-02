import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Plus, MessageCircle, Building2 } from 'lucide-react';

const tabs = [
  { path: '/', label: '홈', icon: Home },
  { path: '/together', label: '함께해요', icon: Users },
  { path: '/write', label: '올리기', icon: Plus, isCenter: true },
  { path: '/chat', label: '채팅', icon: MessageCircle },
  { path: '/my', label: '마이단지', icon: Building2 },
];

export default function BottomTabBar() {
  const location = useLocation();

  return (
    <nav
      className="sticky bottom-0 z-40 bg-card/95 backdrop-blur-xl"
      style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-safe-bottom">
        {tabs.map((tab) => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center gap-1 px-3 py-1 active:scale-90 transition-transform"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'hsl(var(--primary))', boxShadow: '0 4px 16px rgba(93,123,111,0.35)' }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-1 px-3 py-1 active:scale-90 transition-transform"
            >
              <Icon
                className="w-6 h-6 transition-colors"
                style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                strokeWidth={isActive ? 2 : 1.6}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}