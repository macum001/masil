import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OnboardingShell from './OnboardingShell';

const MOCK_OTP = '123456'; // MVP: fixed OTP for testing
const OTP_EXPIRY = 180; // 3 minutes

export default function VerifyPhone() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || sessionStorage.getItem('onboarding_phone') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(OTP_EXPIRY);
  const inputRefs = useRef([]);

  const maskedPhone = phone
    ? `${phone.slice(0, 3)}-${phone.slice(3, 7).replace(/\d/g, '*')}-${phone.slice(7)}`
    : '';

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setError('');
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    setError('');

    // MVP: check against mock OTP
    if (code !== MOCK_OTP) {
      setError('인증번호가 올바르지 않아요. 다시 확인해주세요.');
      setLoading(false);
      return;
    }

    sessionStorage.setItem('phone_verified', 'true');
    navigate('/onboarding/nickname');
    setLoading(false);
  };

  const handleResend = () => {
    setTimer(OTP_EXPIRY);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const code = otp.join('');

  return (
    <OnboardingShell step={2} totalSteps={5} title="인증번호를 입력해주세요" onBack={() => navigate('/onboarding/phone')}>
      <div className="flex-1 px-6 pt-6">
        <p className="text-sm text-muted-foreground mb-1">
          <span className="font-semibold text-foreground">{maskedPhone}</span>로 발송된
        </p>
        <p className="text-sm text-muted-foreground mb-8">6자리 인증번호를 입력해주세요.</p>

        {/* OTP Input */}
        <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className={`w-12 h-14 rounded-xl border text-center text-xl font-bold bg-background text-foreground focus:outline-none transition-all ${
                error
                  ? 'border-destructive focus:ring-2 focus:ring-destructive/30'
                  : 'border-border focus:ring-2 focus:ring-primary/30 focus:border-primary'
              }`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-1 mb-4">
          <span className={`text-sm font-semibold ${timer <= 30 ? 'text-destructive' : 'text-primary'}`}>
            {formatTimer(timer)}
          </span>
        </div>

        {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}

        {/* MVP hint */}
        <p className="text-xs text-muted-foreground/60 text-center">MVP 테스트: 인증번호는 <strong>123456</strong></p>

        <div className="flex justify-center mt-4">
          {timer === 0 ? (
            <button onClick={handleResend} className="text-sm text-primary font-semibold">
              인증번호 재발송
            </button>
          ) : (
            <span className="text-sm text-muted-foreground">
              인증번호가 오지 않나요?{' '}
              <button onClick={handleResend} className="text-primary font-semibold">재발송</button>
            </span>
          )}
        </div>
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={handleVerify}
          disabled={code.length < 6 || loading}
          className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          {loading ? '확인 중...' : '확인'}
        </button>
      </div>
    </OnboardingShell>
  );
}