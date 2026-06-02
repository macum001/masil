import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-background max-w-lg mx-auto">
      {/* Illustration Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8">
        {/* Logo mark */}
        <div className="w-24 h-24 rounded-[28px] bg-primary flex items-center justify-center shadow-xl shadow-primary/25 mb-8">
          <span className="text-4xl">🏘️</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground text-center leading-tight mb-3 font-heading">
          마실
        </h1>
        <p className="text-base text-muted-foreground text-center leading-relaxed">
          우리 단지 이웃과 함께하는<br />
          작은 도움, 큰 연결
        </p>

        {/* Feature list */}
        <div className="mt-10 space-y-3 w-full">
          {[
            { emoji: '🚶', text: '산책 친구 구하기' },
            { emoji: '📦', text: '택배 대신 받아주기' },
            { emoji: '🛒', text: '장보기 같이 가기' },
            { emoji: '🎁', text: '물건 나눔하기' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 bg-secondary/60 rounded-2xl px-4 py-3">
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm font-medium text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10 space-y-3">
        <button
          onClick={() => navigate('/onboarding/phone')}
          className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          시작하기
        </button>
        <p className="text-xs text-muted-foreground text-center">
          이미 계정이 있으신가요?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-semibold">
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}