import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, FileText, MessageCircle, Settings, LogOut, CheckSquare, Lock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { userService, requestService, authService } from '@/services/api';
import { toast, confirmDialog } from '@/components/Dialog';
import { apartmentService } from '@/services/api';
import { MapPin, Navigation, CheckCircle2, Loader2, Search } from 'lucide-react';
import RequestCard from '../components/home/RequestCard';
import PostDetail from './PostDetail';

function mapRequest(row) {
  return {
    id: row.id,
    post_type: row.post_type,
    category: row.category,
    title: row.title,
    content: row.content,
    location: row.apartment_name || row.location_text || '우리 단지',
    timeAgo: row.time_ago || '방금 전',
    gratitude: row.gratitude_type === 'excluded' ? null
             : row.gratitude_type === 'available' ? 'yes'
             : row.gratitude_type === 'none' ? 'no'
             : row.gratitude_type === 'give' ? 'give'
             : row.gratitude_type,
    status: row.status || 'waiting',
    user_id: row.user_id,
    nickname: row.nickname,
  };
}

export default function MyComplex() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ help_count: 0, thanks_count: 0, manner_temp: 36.5, my_posts: 0, my_helped: 0 });
  const [view, setView] = useState('main'); // main | myposts | myhelped | settings
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    userService.getStats().then(setStats).catch(() => {});
  }, []);

  const apartmentName = user?.apartment_name || '우리 아파트';
  const nickname = user?.nickname || user?.email?.split('@')[0] || '이웃';

  const openList = async (type) => {
    setView(type);
    setLoadingList(true);
    try {
      const data = type === 'myposts' ? await requestService.myPosts() : await requestService.myHelped();
      setList(data.map(mapRequest));
    } catch {
      setList([]);
    } finally {
      setLoadingList(false);
    }
  };

  // 상세 보기
  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  // 목록 화면 (내 글 / 참여한 글)
  if (view === 'myposts' || view === 'myhelped') {
    const title = view === 'myposts' ? '내가 올린 글' : '내가 참여한 글';
    return (
      <div className="flex flex-col min-h-full">
        <header className="sticky top-0 z-30 glass-header">
          <div className="flex items-center gap-3 px-5 pt-5 pb-4">
            <button onClick={() => setView('main')} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
              <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
            </button>
            <h1 className="text-[18px] font-bold text-foreground tracking-tight">{title}</h1>
          </div>
        </header>
        <div className="px-5 pt-4 pb-32 space-y-3">
          {loadingList ? (
            <p className="text-center text-[13px] text-muted-foreground py-10">불러오는 중...</p>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-4">📭</span>
              <p className="text-[15px] font-semibold text-foreground">아직 없어요</p>
            </div>
          ) : list.map((post) => (
            <RequestCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))}
        </div>
      </div>
    );
  }

// 단지 위치 재인증 화면
  if (view === 'relocate') {
    return <RelocateView onBack={() => setView('main')} onDone={() => { setView('main'); window.location.reload(); }} />;
  }

  // 계정 설정 화면
  if (view === 'settings') {
    return <AccountSettings onBack={() => setView('main')} onLogout={logout} />;
  }

  // 메인 화면
  const menuSections = [
    {
      title: '내 활동',
      items: [
        { icon: FileText, label: '내가 올린 글', count: stats.my_posts || 0, onClick: () => openList('myposts') },
        { icon: CheckSquare, label: '내가 참여한 글', count: stats.my_helped || 0, onClick: () => openList('myhelped') },
        { icon: MessageCircle, label: '채팅 내역', count: null, onClick: () => navigate('/chat') },
      ],
    },
    {
      title: '계정',
      items: [
        { icon: Settings, label: '계정 설정', count: null, onClick: () => setView('settings') },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-30 glass-header">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight font-heading">마이단지</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">나의 활동과 단지 정보</p>
        </div>
      </header>

      <div className="px-5 pb-32 space-y-4">
        {/* 프로필 카드 */}
        <div className="relative overflow-hidden rounded-[20px] p-6"
          style={{ background: 'linear-gradient(145deg, hsl(222 16% 16%) 0%, hsl(222 18% 12%) 100%)', border: '1px solid hsl(222 12% 24%)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,141,245,0.18) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1">우리단지</p>
                <p className="text-[15px] font-bold text-foreground tracking-tight">{apartmentName}</p>
              </div>
              <button onClick={() => setView('relocate')} className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-transform" style={{ background: 'rgba(109,141,245,0.18)', color: '#9DB2F8' }}>📍 단지 변경</button>
            </div>
            <div className="mb-4" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(109,141,245,0.35) 0%, transparent 100%)' }} />
            <div className="mb-4">
              <p className="text-[22px] font-bold text-foreground tracking-tight leading-tight">{nickname}</p>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">입주민</p>
            </div>
            <p className="text-[12px] font-medium" style={{ color: '#9DB2F8' }}>함께한 기록이 쌓이고 있어요 ✦</p>
          </div>
        </div>

        {/* 통계 */}
        <div className="rounded-[20px] p-4" style={{ background: 'hsl(222 16% 13%)', border: '1px solid hsl(222 12% 22%)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { label: '도움 준 횟수', value: `${stats.help_count}` },
              { label: '감사 받은 수', value: `${stats.thanks_count}` },
              { label: '매너 온도', value: `${stats.manner_temp}°` },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-2 py-1">
                <p className="text-[20px] font-bold" style={{ color: '#9DB2F8' }}>{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 메뉴 */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{section.title}</p>
            <div className="rounded-[20px] overflow-hidden" style={{ background: 'hsl(222 16% 13%)', border: '1px solid hsl(222 12% 22%)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={item.onClick}
                    className={`w-full flex items-center gap-3.5 px-5 py-4 hover:bg-white/5 transition-colors ${idx > 0 ? 'border-t border-border' : ''}`}>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-left text-[15px] font-medium text-foreground">{item.label}</span>
                    {item.count !== null && <span className="text-[13px] font-semibold mr-1" style={{ color: '#9DB2F8' }}>{item.count}</span>}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button onClick={logout} className="flex items-center gap-2 px-1 py-3 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" />로그아웃
        </button>
      </div>
    </div>
  );
}

// ── 계정 설정 화면 ──
function AccountSettings({ onBack, onLogout }) {
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChangePw = async () => {
    setMsg(null);
    if (!curPw || !newPw) return setMsg({ type: 'err', text: '비밀번호를 입력해주세요.' });
    if (newPw !== newPw2) return setMsg({ type: 'err', text: '새 비밀번호가 일치하지 않아요.' });
    if (newPw.length < 6) return setMsg({ type: 'err', text: '새 비밀번호는 6자 이상이어야 해요.' });

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword: curPw, newPassword: newPw });
      setMsg({ type: 'ok', text: '비밀번호가 변경되었어요!' });
      toast('비밀번호가 변경되었어요!', 'success');
      setCurPw(''); setNewPw(''); setNewPw2('');
    } catch (error) {
      setMsg({ type: 'err', text: error.message || '변경 실패' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: '회원 탈퇴',
      message: '정말 탈퇴하시겠어요? 모든 데이터가 삭제되며 되돌릴 수 없어요.',
      confirmText: '탈퇴하기',
      cancelText: '취소',
      danger: true,
    });
    if (!ok) return;
    try {
      await authService.deleteAccount();
      toast('탈퇴가 완료되었어요.', 'success');
      setTimeout(() => { window.location.href = '/login'; }, 800);
    } catch (error) {
      toast(error.message || '탈퇴 실패', 'error');
    }
  };

  const inputStyle = "w-full h-12 px-4 rounded-[12px] bg-secondary text-foreground text-[15px] outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-30 glass-header">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
          </button>
          <h1 className="text-[18px] font-bold text-foreground tracking-tight">계정 설정</h1>
        </div>
      </header>

      <div className="px-5 pt-4 pb-32 space-y-6">
        {/* 비밀번호 변경 */}
        <div>
          <p className="text-[14px] font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" style={{ color: '#9DB2F8' }} /> 비밀번호 변경
          </p>
          <div className="space-y-2.5">
            <input type="password" placeholder="현재 비밀번호" value={curPw} onChange={(e) => setCurPw(e.target.value)} className={inputStyle} />
            <input type="password" placeholder="새 비밀번호 (6자 이상)" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputStyle} />
            <input type="password" placeholder="새 비밀번호 확인" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} className={inputStyle} />
          </div>

          {msg && (
            <p className="text-[13px] mt-2.5 px-1" style={{ color: msg.type === 'ok' ? '#34D9A8' : 'hsl(0 70% 65%)' }}>
              {msg.text}
            </p>
          )}

          <button onClick={handleChangePw} disabled={loading}
            className="w-full h-12 mt-3 rounded-[12px] text-[15px] font-semibold"
            style={{ background: 'linear-gradient(135deg, #6D8DF5 0%, #7B6EF6 100%)', color: '#fff' }}>
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>

        <div className="h-px bg-border" />

        {/* 회원 탈퇴 */}
        <div>
          <p className="text-[14px] font-semibold mb-2 flex items-center gap-2" style={{ color: 'hsl(0 70% 65%)' }}>
            <Trash2 className="w-4 h-4" /> 회원 탈퇴
          </p>
          <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">
            탈퇴하면 모든 글, 채팅, 활동 기록이 영구 삭제되며 복구할 수 없어요.
          </p>
          <button onClick={handleDelete}
            className="w-full h-12 rounded-[12px] text-[15px] font-semibold"
            style={{ background: 'rgba(220,80,80,0.12)', color: 'hsl(0 70% 65%)', border: '1px solid rgba(220,80,80,0.3)' }}>
            회원 탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}


const SAMPLE_APTS = [
  { id: 1, name: '래미안 대치팰리스', address: '서울 강남구 대치동 955', lat: 37.4938, lng: 127.0619 },
  { id: 2, name: '한강 자이', address: '서울 마포구 합정동 414', lat: 37.5497, lng: 126.9097 },
  { id: 3, name: '반포 리체', address: '서울 서초구 반포동 180', lat: 37.5105, lng: 126.9999 },
];
const RELOCATE_RADIUS = 1000;

function relocateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function RelocateView({ onBack, onDone }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await apartmentService.list(query);
        const all = (res && res.length > 0) ? res : SAMPLE_APTS;
        const lower = query.toLowerCase();
        setResults(all.filter((a) => a.name.toLowerCase().includes(lower) || (a.address || '').toLowerCase().includes(lower)));
      } catch {
        const lower = query.toLowerCase();
        setResults(SAMPLE_APTS.filter((a) => a.name.toLowerCase().includes(lower)));
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleVerify = () => {
    if (!selected) { toast('먼저 아파트를 선택해주세요', 'error'); return; }
    setErrorMsg('');
    if (!navigator.geolocation) {
      setStatus('fail'); setErrorMsg('이 브라우저는 위치 기능을 지원하지 않아요.'); return;
    }
    setStatus('checking');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const aptLat = Number(selected.lat), aptLng = Number(selected.lng);
        if (aptLat && aptLng) {
          const dist = relocateDistance(pos.coords.latitude, pos.coords.longitude, aptLat, aptLng);
          if (dist > RELOCATE_RADIUS) {
            setStatus('fail');
            setErrorMsg(`선택한 단지에서 약 ${(dist / 1000).toFixed(1)}km 떨어져 있어요.`);
            return;
          }
        }
        try {
          await authService.updateProfile({
            apartment_id: selected.id,
            apartment_name: selected.name,
            gps_verified: true,
            verification_status: 'approved',
          });
          setStatus('success');
          toast('단지가 변경되었어요!', 'success');
          setTimeout(onDone, 1000);
        } catch (e) {
          setStatus('fail'); setErrorMsg('저장에 실패했어요. 다시 시도해주세요.');
        }
      },
      (err) => {
        setStatus('fail');
        setErrorMsg(err.code === 1 ? '위치 권한이 거부됐어요. 허용 후 다시 시도해주세요.' : '위치를 가져올 수 없어요.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-30 glass-header">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
          </button>
          <h1 className="text-[18px] font-bold text-foreground tracking-tight">단지 위치 변경</h1>
        </div>
      </header>

      <div className="px-5 pt-4 pb-32">
        <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
          이사하셨나요? 새 단지를 검색하고 현재 위치로 다시 인증하면 단지가 변경돼요.
        </p>

        <div className="flex items-center gap-2 rounded-[14px] px-4 h-12 mb-3" style={{ background: 'hsl(222 16% 13%)', border: '1px solid hsl(222 12% 22%)' }}>
          <Search className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="아파트 이름 검색"
            className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {results.length > 0 && (
          <div className="space-y-2 mb-4">
            {results.map((apt) => (
              <button
                key={apt.id}
                onClick={() => setSelected(apt)}
                className="w-full text-left rounded-[14px] p-3.5 transition-all active:scale-[0.99]"
                style={{
                  background: selected?.id === apt.id ? 'rgba(109,141,245,0.12)' : 'hsl(222 16% 13%)',
                  border: selected?.id === apt.id ? '1px solid rgba(109,141,245,0.4)' : '1px solid hsl(222 12% 22%)',
                }}
              >
                <p className="text-[14px] font-semibold text-foreground">{apt.name}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{apt.address}</p>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="rounded-[16px] p-4 mb-4" style={{ background: 'rgba(109,141,245,0.10)', border: '1px solid rgba(109,141,245,0.3)' }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5" style={{ color: '#6D8DF5' }} />
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-foreground">{selected.name}</p>
                <p className="text-[12px] text-muted-foreground">{selected.address}</p>
              </div>
              {status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            </div>

            {status === 'checking' ? (
              <div className="h-12 rounded-[12px] flex items-center justify-center gap-2" style={{ background: 'hsl(222 14% 20%)' }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#6D8DF5' }} />
                <span className="text-[14px] text-muted-foreground">위치 확인 중...</span>
              </div>
            ) : status !== 'success' && (
              <button
                onClick={handleVerify}
                className="w-full h-12 rounded-[12px] flex items-center justify-center gap-2 text-[15px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6D8DF5 0%, #7B6EF6 100%)' }}
              >
                <Navigation className="w-[18px] h-[18px]" />
                현재 위치로 인증하기
              </button>
            )}

            {status === 'fail' && errorMsg && (
              <p className="text-[12px] text-destructive mt-2 text-center">{errorMsg}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}