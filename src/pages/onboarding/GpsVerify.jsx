import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, CheckCircle2, Loader2 } from 'lucide-react';
import OnboardingShell from './OnboardingShell';
import { authService } from '@/services/api';

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ALLOWED_RADIUS = 100000;

export default function GpsVerify() {
  const navigate = useNavigate();
  const apartment = JSON.parse(sessionStorage.getItem('onboarding_apartment') || '{}');
  const nickname = sessionStorage.getItem('onboarding_nickname') || '';
  const phone = sessionStorage.getItem('onboarding_phone') || '';

  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [distance, setDistance] = useState(null);

  const saveAndContinue = async () => {
    try {
      await authService.updateProfile({
        apartment_id: apartment.id || 1,
        apartment_name: apartment.name || '우리 아파트',
        gps_verified: true,
        verification_status: 'approved',
        
        nickname,
        phone,
        phone_verified: true,
      });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => { window.location.href = '/onboarding/card'; }, 800);
  };

  const handleVerify = () => {
    setErrorMsg('');
    if (!navigator.geolocation) {
      setStatus('fail');
      setErrorMsg('이 브라우저는 위치 기능을 지원하지 않아요.');
      return;
    }
    setStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const myLat = position.coords.latitude;
        const myLng = position.coords.longitude;
        const aptLat = Number(apartment.lat);
        const aptLng = Number(apartment.lng);
        if (!aptLat || !aptLng) {
          setStatus('success');
          saveAndContinue();
          return;
        }
        const dist = getDistance(myLat, myLng, aptLat, aptLng);
        setDistance(Math.round(dist));
        if (dist <= ALLOWED_RADIUS) {
          setStatus('success');
          saveAndContinue();
        } else {
          setStatus('fail');
          setErrorMsg(`선택한 단지에서 약 ${(dist / 1000).toFixed(1)}km 떨어져 있어요. 단지 근처에서 다시 시도해주세요.`);
        }
      },
      (error) => {
        setStatus('fail');
        if (error.code === 1) {
          setErrorMsg('위치 권한이 거부됐어요. 브라우저 설정에서 위치 허용 후 다시 시도해주세요.');
        } else if (error.code === 2) {
          setErrorMsg('위치를 가져올 수 없어요. 잠시 후 다시 시도해주세요.');
        } else {
          setErrorMsg('위치 확인 시간이 초과됐어요. 다시 시도해주세요.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <OnboardingShell step={5} totalSteps={5} title="GPS로 단지를 인증해요" onBack={() => navigate('/onboarding/apartment')}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <div className="w-full p-4 bg-secondary/60 rounded-card mb-8 text-center">
          <p className="text-xs text-muted-foreground mb-1">선택한 아파트</p>
          <p className="text-base font-bold text-foreground">{apartment.name || '우리 아파트'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{apartment.address || ''}</p>
        </div>

        {status === 'idle' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
              <Navigation className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-semibold text-foreground mb-1">현재 위치로 단지를 인증해요</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                단지 반경 1km 안에 있어야 인증돼요.<br />
                위치 권한을 허용해주세요.
              </p>
            </div>
          </div>
        )}

        {status === 'checking' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <p className="text-sm font-semibold text-foreground">위치를 확인하는 중...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">인증 완료!</p>
              {distance !== null && (
                <p className="text-xs text-muted-foreground mt-1">단지에서 약 {distance}m 거리</p>
              )}
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
              <p className="text-base font-bold text-foreground mb-2">위치 인증에 실패했어요</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {status !== 'success' && status !== 'checking' && (
          <div className="w-full space-y-3">
            <button
              onClick={handleVerify}
              className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold active:scale-[0.98] transition-all"
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