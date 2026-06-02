import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CompleteCard() {
  const navigate = useNavigate();
  const apartment = JSON.parse(sessionStorage.getItem('onboarding_apartment') || '{}');
  const nickname = sessionStorage.getItem('onboarding_nickname') || '이웃';

  const [visible, setVisible] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setCardFlipped(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleEnter = () => {
    // Clear onboarding session data
    sessionStorage.removeItem('onboarding_phone');
    sessionStorage.removeItem('onboarding_nickname');
    sessionStorage.removeItem('onboarding_apartment');
    sessionStorage.removeItem('phone_verified');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 relative">
        {/* Title */}
        <div
          className="text-center mb-8 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
        >
          <p className="text-sm font-medium text-primary mb-2">🎉 가입 완료</p>
          <h1 className="text-2xl font-bold text-foreground leading-tight font-heading">
            {nickname}님,<br />환영해요!
          </h1>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-xs transition-all duration-700 delay-300"
          style={{ opacity: cardFlipped ? 1 : 0, transform: cardFlipped ? 'scale(1) rotateY(0)' : 'scale(0.92) rotateY(-15deg)' }}
        >
          <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-primary/20">
            {/* Card background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-800" />
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-white/8" />

            <div className="relative p-7">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/70 text-xs font-medium">우리단지 카드</p>
                  <p className="text-white text-lg font-bold mt-0.5">{apartment.name}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-xl">🏘️</span>
                </div>
              </div>

              {/* Message */}
              <div className="bg-white/15 rounded-2xl p-4 mb-6">
                <p className="text-white text-sm leading-relaxed">
                  {apartment.name} 이웃이 되셨어요.<br /><br />
                  우리 단지엔 지금도<br />
                  편의점 가는 이웃,<br />
                  산책 나가는 이웃,<br />
                  필요한 물건을 나눠주는 이웃이 있어요.<br /><br />
                  당신도 누군가에게<br />
                  그런 이웃이 될 수 있어요.
                </p>
              </div>

              {/* Card footer */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-xs">닉네임</p>
                  <p className="text-white font-bold text-base mt-0.5">{nickname}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">가입일</p>
                  <p className="text-white font-medium text-sm mt-0.5">
                    {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub message */}
        <div
          className="mt-8 text-center transition-all duration-700 delay-500"
          style={{ opacity: cardFlipped ? 1 : 0, transform: cardFlipped ? 'translateY(0)' : 'translateY(12px)' }}
        >
          <p className="text-sm text-muted-foreground">
            이제 이웃들과 함께해보세요 ✨
          </p>
        </div>
      </div>

      {/* CTA */}
      <div
        className="px-6 pb-10 transition-all duration-700 delay-700"
        style={{ opacity: cardFlipped ? 1 : 0, transform: cardFlipped ? 'translateY(0)' : 'translateY(12px)' }}
      >
        <button
          onClick={handleEnter}
          className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          우리 단지 입장하기 →
        </button>
      </div>
    </div>
  );
}