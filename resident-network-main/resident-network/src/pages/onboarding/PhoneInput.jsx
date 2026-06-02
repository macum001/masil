import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import { base44 } from '@/api/base44Client';

const BAD_WORDS = ['욕설1', '씨발', '개새끼', '병신'];

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function PhoneInput() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length === 11 && digits.startsWith('01');

  const handleChange = (e) => {
    setError('');
    setPhone(formatPhone(e.target.value));
  };

  const handleSend = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      // MVP: simulate OTP send — store phone in sessionStorage and navigate
      sessionStorage.setItem('onboarding_phone', digits);
      // In production, call SMS API here
      navigate('/onboarding/verify', { state: { phone: digits } });
    } catch (e) {
      setError('인증번호 전송에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell step={1} totalSteps={5} title="휴대폰 번호를 입력해주세요" onBack={() => navigate('/onboarding')}>
      <div className="flex-1 px-6 pt-6">
        <p className="text-sm text-muted-foreground mb-6">
          인증번호를 받을 번호를 입력해주세요.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">휴대폰 번호</label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            autoFocus
            className="w-full h-14 px-4 rounded-input border border-border bg-background text-foreground text-lg font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          입력하신 번호로 6자리 인증번호가 발송됩니다.<br />
          SMS 수신이 가능한 번호를 입력해주세요.
        </p>
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={handleSend}
          disabled={!isValid || loading}
          className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          {loading ? '전송 중...' : '인증번호 받기'}
        </button>
      </div>
    </OnboardingShell>
  );
}