import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, ChevronRight, MapPin } from 'lucide-react';
import OnboardingShell from './OnboardingShell';
import { base44 } from '@/api/base44Client';

// Fallback sample data for MVP
const SAMPLE_APARTMENTS = [
  { id: 'apt1', name: '래미안 대치팰리스', address: '서울특별시 강남구 대치동 955', household_count: 1320, lat: 37.4938, lng: 127.0619 },
  { id: 'apt2', name: '한강 자이', address: '서울특별시 마포구 합정동 414', household_count: 862, lat: 37.5497, lng: 126.9097 },
  { id: 'apt3', name: '반포 리체', address: '서울특별시 서초구 반포동 180', household_count: 2444, lat: 37.5105, lng: 126.9999 },
  { id: 'apt4', name: 'e편한세상 금호파크힐스', address: '서울특별시 성동구 금호동 1가 111', household_count: 988, lat: 37.5543, lng: 127.0186 },
  { id: 'apt5', name: '마포 래미안 푸르지오', address: '서울특별시 마포구 염리동 168', household_count: 3885, lat: 37.5494, lng: 126.9526 },
  { id: 'apt6', name: '은평 뉴타운 래미안', address: '서울특별시 은평구 진관동 123', household_count: 1560, lat: 37.6337, lng: 126.9108 },
  { id: 'apt7', name: '송파 파크하비오', address: '서울특별시 송파구 문정동 150', household_count: 640, lat: 37.4889, lng: 127.1214 },
  { id: 'apt8', name: '목동 신시가지 7단지', address: '서울특별시 양천구 목동 915', household_count: 1494, lat: 37.5303, lng: 126.8753 },
];

export default function ApartmentSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await base44.entities.Apartment.filter({});
        const all = res.length > 0 ? res : SAMPLE_APARTMENTS;
        const lower = query.toLowerCase();
        setResults(all.filter((a) =>
          a.name.toLowerCase().includes(lower) || a.address.toLowerCase().includes(lower)
        ));
      } catch {
        const lower = query.toLowerCase();
        setResults(SAMPLE_APARTMENTS.filter((a) =>
          a.name.toLowerCase().includes(lower) || a.address.toLowerCase().includes(lower)
        ));
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (apt) => {
    setSelected(apt);
  };

  const handleNext = () => {
    if (!selected) return;
    sessionStorage.setItem('onboarding_apartment', JSON.stringify(selected));
    navigate('/onboarding/gps');
  };

  return (
    <OnboardingShell step={4} totalSteps={5} title="우리 아파트를 찾아주세요" onBack={() => navigate('/onboarding/nickname')}>
      <div className="flex-1 flex flex-col px-6 pt-6 min-h-0">
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            placeholder="아파트명 또는 주소 검색"
            autoFocus
            className="w-full h-14 pl-11 pr-10 rounded-input border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSelected(null); }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Selected Preview */}
        {selected && (
          <div className="mb-4 p-4 bg-accent rounded-card border border-primary/20">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">{selected.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.address}</p>
                {selected.household_count && (
                  <p className="text-xs text-primary font-medium mt-1">{selected.household_count.toLocaleString()}세대</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="flex flex-col items-center py-12">
              <Building2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                검색 결과가 없어요.<br />아파트명이나 주소를 다시 확인해주세요.
              </p>
            </div>
          )}

          {!loading && !query && (
            <div className="flex flex-col items-center py-12">
              <MapPin className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                거주하시는 아파트를 검색해주세요.<br />
                GPS 인증으로 단지를 확인합니다.
              </p>
            </div>
          )}

          <div className="space-y-2 pb-4">
            {results.map((apt) => (
              <button
                key={apt.id}
                onClick={() => handleSelect(apt)}
                className={`w-full flex items-center gap-3 p-4 rounded-card border text-left transition-all active:scale-[0.98] ${
                  selected?.id === apt.id
                    ? 'border-primary bg-accent'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50'
                }`}
              >
                <Building2 className={`w-5 h-5 flex-shrink-0 ${selected?.id === apt.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{apt.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{apt.address}</p>
                  {apt.household_count && (
                    <p className="text-xs text-primary font-medium mt-0.5">{apt.household_count.toLocaleString()}세대</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 pt-3">
        <button
          onClick={handleNext}
          disabled={!selected}
          className="w-full h-14 rounded-button bg-primary text-primary-foreground text-base font-bold disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          이 아파트로 선택하기
        </button>
      </div>
    </OnboardingShell>
  );
}