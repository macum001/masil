import React from 'react';
import { ChevronRight, FileText, MessageCircle, Settings, LogOut, CheckSquare } from 'lucide-react';

const menuSections = [
  {
    title: '내 활동',
    items: [
      { icon: FileText, label: '내가 올린 글', count: 3 },
      { icon: CheckSquare, label: '내가 참여한 글', count: 5 },
      { icon: MessageCircle, label: '채팅 내역', count: null },
    ],
  },
  {
    title: '계정',
    items: [
      { icon: Settings, label: '계정 설정', count: null },
    ],
  },
];

export default function MyComplex() {
  return (
    <div className="flex flex-col min-h-full bg-background">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight font-heading">마이단지</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">나의 활동과 단지 정보</p>
        </div>
      </header>

      <div className="px-5 pb-32 space-y-4">

        {/* ── 우리단지 이웃 카드 ── */}
        <div
          className="relative overflow-hidden rounded-[20px] p-6"
          style={{
            background: 'linear-gradient(135deg, #FDFCF8 0%, #FFF8F2 100%)',
            border: '1px solid rgba(255,138,61,0.18)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Subtle background mark */}
          <div
            className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-[0.06]"
            style={{ background: '#FF8A3D' }}
          />
          <div
            className="absolute right-10 bottom-2 w-10 h-10 rounded-full opacity-[0.05]"
            style={{ background: '#FF8A3D' }}
          />

          {/* Card content */}
          <div className="relative">
            {/* Top row */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1">
                  우리단지
                </p>
                <p className="text-[15px] font-bold text-foreground tracking-tight">
                  래미안 대치팰리스
                </p>
              </div>
              <div
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(255,138,61,0.12)', color: '#C05A1F' }}
              >
                이웃 카드
              </div>
            </div>

            {/* Divider */}
            <div
              className="mb-4"
              style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,138,61,0.25) 0%, transparent 100%)' }}
            />

            {/* User info */}
            <div className="mb-4">
              <p className="text-[22px] font-bold text-foreground tracking-tight leading-tight">
                김마실
              </p>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                101동 이웃
              </p>
            </div>

            {/* Bottom message */}
            <div className="flex items-center justify-between">
              <p
                className="text-[12px] font-medium"
                style={{ color: '#C05A1F' }}
              >
                함께한 기록이 쌓이고 있어요 ✦
              </p>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF8A3D', opacity: 0.8 }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF8A3D', opacity: 0.4 }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF8A3D', opacity: 0.2 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div
          className="rounded-[20px] p-4 bg-card"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid hsl(var(--border))' }}
        >
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { label: '도움 준 횟수', value: '12' },
              { label: '감사 받은 수', value: '8' },
              { label: '매너 온도', value: '36.5°' },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-2 py-1">
                <p className="text-[20px] font-bold" style={{ color: '#FF8A3D' }}>{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Menu Sections ── */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              {section.title}
            </p>
            <div
              className="rounded-[20px] bg-card overflow-hidden"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid hsl(var(--border))' }}
            >
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3.5 px-5 py-4 hover:bg-secondary/50 active:bg-secondary transition-colors ${
                      idx < section.items.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                      style={{ background: 'rgba(93,123,111,0.10)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: '#5D7B6F' }} strokeWidth={1.8} />
                    </div>
                    <span className="flex-1 text-[15px] font-medium text-foreground text-left">
                      {item.label}
                    </span>
                    {item.count !== null && (
                      <span className="text-[13px] font-medium text-muted-foreground mr-1">
                        {item.count}건
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Logout ── */}
        <button className="flex items-center gap-2 px-1 py-3 text-[14px] text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" strokeWidth={1.8} />
          로그아웃
        </button>

      </div>
    </div>
  );
}