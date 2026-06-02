import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingShell from './OnboardingShell';

const BAD_WORDS = ['욕설', '씨발', '개새끼', '병신', '바보', '멍청'];
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]+$/;

function validateNickname(value) {
  if (value.length < 2) return '닉네임은 2자 이상이어야 해요.';
  if (value.length > 12) return '닉네임은 12자 이하여야 해요.';
  if (!NICKNAME_REGEX.test(value)) return '특수문자는 사용할 수 없어요.';
  if (BAD_WORDS.some((w) => value.includes(w))) return '사용할 수 없는 단어가 포함되어 있어요.';
  return '';
}

export default function Nickname() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [touched, setTouched] = useState(false);

  const error = touched ? validateNickname(nickname) : '';
  const isValid = nickname.length >= 2 && !validateNickname(nickname);

  const handleChange = (e) => {
    setNickname(e.target.value);
    if (!touched) setTouched(true);
  };

  const handleNext = () => {
    if (!isValid) return;
    sessionStorage.setItem('onboarding_nickname', nickname);
    navigate('/onboarding/apartment');
  };

  return (
    <OnboardingShell step={3} totalSteps={5} title="어떻게 불러드릴까요?" onBack={() => navigate('/onboarding/verify')}>
      <div className="flex-1 px-6 pt-6">
        <p className="text-sm text-muted-foreground mb-8">
          이웃들에게 보여질 닉네임을 설정해주세요.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">닉네임</label>
          <div className="relative">
            <input
              type="text"
              value={nickname}
              onChange={handleChange}
              onBlur={() => setTouched(true)}
              placeholder="닉네임 입력"
              maxLength={12}
              autoFocus
              className={`w-full h-14 px-4 pr-16 rounded-input border bg-background text-foreground text-base font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-destructive focus:ring-destructive/30'
                  : isValid
                  ? 'border-primary focus:ring-primary/30'
                  : 'border-border focus:ring-primary/30 focus:border-primary'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {nickname.length}/12
            </span>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {isValid && (
            <p className="text-sm text-emerald-600 font-medium">✓ 사용 가능한 닉네임이에요</p>
          )}
        </div>

        <div className="mt-8 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">닉네임 규칙</p>
          {[
            '한글, 영문, 숫자 사용 가능',
            '특수문자 사용 불가',
            '2자 이상 12자 이하',
          ].map((rule) => (
            <p key={rule} className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              {rule}
            </p>
          ))}
        </div>
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          다음
        </button>
      </div>
    </OnboardingShell>
  );
}