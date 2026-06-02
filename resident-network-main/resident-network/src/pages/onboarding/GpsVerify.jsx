import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import OnboardingShell from './OnboardingShell';
import { base44 } from '@/api/base44Client';

const RADIUS_METERS = 300;

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function GpsVerify() {
  const navigate = useNavigate();
  const apartment = JSON.parse(sessionStorage.getItem('onboarding_apartment') || '{}');
  const nickname = sessionStorage.getItem('onboarding_nickname') || '';
  const phone = sessionStorage.getItem('onboarding_phone') || '';

  const [status, setStatus] = useState('idle'); // idle | checking | success | fail
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = () => {
    setStatus('checking');
    setErrorMsg('');

    if (!navigator.geolocation) {
      setStatus('fail');
      setErrorMsg('이 기기는 GPS를 지원하지 않아요.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = getDistance(latitude, longitude, apartment.lat, apartment.lng);

        if (distance <= RADIUS_METERS) {
          setStatus('success');
          try {
            const user = await base44.auth.me();
            if (user) {
              await base44.auth.updateMe({
                apartment_id: apartment.id,
                apartment_name: apartment.name,
                gps_verified: true,
                verification_status: 'approved',
                card_issued_at: new Date().toISOString(),
                nickname,
                phone,
                phone_verified: true,
              });
            }
          } catch (e) {
            // Continue even if update fails in MVP
          }
          setTimeout(() => navigate('/onboarding/card'), 1200);
        } else {
          setStatus('fail');
        }
      },
      () => {
        setStatus('fail');
        setErrorMsg('위치 접근을 허용해주세요.');
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <OnboardingShell step={5} totalSteps={5} title="GPS로 단지를 인증해요" onBack={() => navigate('/onboarding/apartment')}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">

        {/* Apartment Info */}
        <div className="w-full p-4 bg-secondary/60 rounded-card mb-8 text-center">
          <p className="text-xs text-muted-foreground mb-1">선택한 아파트</p>
          <p className="text-base font-bold text-foreground">{apartment.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{apartment.address}</p>
        </div>

        {/* Status Illustration */}
        {status === 'idle' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
              <Navigation className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">현재 위치를 확인할게요</p>
              <p className="text-xs text-muted-foreground">선택한 아파트 반경 300m 이내인지 확인합니다.</p>
            </div>
          </div>
        )}

        {status === 'checking' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-sm font-semibold text-foreground">위치 확인 중...</p>
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
                현재 위치가 선택한 아파트와 조금 떨어져 있어요.<br />
                아파트 단지 근처에서 다시 시도해 주세요.
              </p>
              {errorMsg && <p className="text-xs text-destructive mt-2">{errorMsg}</p>}
            </div>
          </div>
        )}

        {/* Buttons */}
        {status !== 'success' && (
          <div className="w-full space-y-3">
            <button
              onClick={handleVerify}
              disabled={status === 'checking'}
              className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              {status === 'fail' ? '다시 확인하기' : '현재 위치 확인하기'}
            </button>
            {status === 'fail' && (
              <button
                onClick={() => navigate('/onboarding/apartment')}
                className="w-full h-14 rounded-button border border-border bg-background text-foreground text-base font-semibold active:scale-[0.98] transition-all"
              >
                아파트 다시 선택하기
              </button>
            )}
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}