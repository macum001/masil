import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import OnboardingShell from './OnboardingShell';
import { authService } from '@/services/api';

export default function GpsVerify() {
  const navigate = useNavigate();
  const apartment = JSON.parse(sessionStorage.getItem('onboarding_apartment') || '{}');
  const nickname = sessionStorage.getItem('onboarding_nickname') || '';
  const phone = sessionStorage.getItem('onboarding_phone') || '';

  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async () => {
    setStatus('success');
    setErrorMsg('');

    try {
      await authService.updateProfile({
        apartment_id: apartment.id || 1,
        apartment_name: apartment.name || '테스트 아파트',
        gps_verified: true,
        verification_status: 'approved',
        card_issued_at: new Date().toISOString(),
        nickname,
        phone,
        phone_verified: true,
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => navigate('/onboarding/card'), 800);
  };

  return (
    <OnboardingShell step={5} totalSteps={5} title="GPS로 단지를 인증해요" onBack={() => navigate('/onboarding/apartment')}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">

        <div className="w-full p-4 bg-secondary/60 rounded-card mb-8 text-center">
          <p className="text-xs text-muted-foreground mb-1">선택한 아파트</p>
          <p className="text-base font-bold text-foreground">{apartment.name || '테스트 아파트'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{apartment.address || '테스트 주소'}</p>
        </div>

        {status === 'idle' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
              <Navigation className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">테스트 인증을 진행합니다</p>
              <p className="text-xs text-muted-foreground">MVP 테스트에서는 GPS 위치 확인을 임시 통과합니다.</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">인증 완료!</p>
              <p className="text-sm text-muted-foreground mt-1">단지 카드를 발급하고 있어요.</p>
            </div>
          </div>
        )}

        {status === 'fail' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center px-4">
              <p className="text-base font-bold text-foreground mb-2">위치를 확인할 수 없어요</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                다시 시도해주세요.
              </p>
              {errorMsg && <p className="text-xs text-destructive mt-2">{errorMsg}</p>}
            </div>
          </div>
        )}

        {status !== 'success' && (
          <div className="w-full space-y-3">
            <button
              onClick={handleVerify}
              className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              현재 위치 확인하기
            </button>
            <button
              onClick={() => navigate('/onboarding/apartment')}
              className="w-full h-14 rounded-button border border-border bg-background text-foreground text-base font-semibold active:scale-[0.98] transition-all"
            >
              아파트 다시 선택하기
            </button>
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}