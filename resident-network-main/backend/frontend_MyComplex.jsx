import React, { useEffect, useState } from 'react';
import {
  ChevronRight, FileText, MessageCircle, Settings,
  LogOut, CheckSquare, Bell, Lock, Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { userService, requestService } from '@/services/api';
import { useNavigate } from 'react-router-dom';

export default function MyComplex() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    help_count: 0,
    thanks_count: 0,
    manner_temp: 36.5,
    my_posts: 0,
    my_helped: 0,
  });
  const [myPosts, setMyPosts] = useState([]);
  const [myHelped, setMyHelped] = useState([]);
  const [view, setView] = useState('main'); // 'main' | 'my_posts' | 'my_helped' | 'settings'
  const [loadingStats, setLoadingStats] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
  const [settingsMsg, setSettingsMsg] = useState('');

  const apartmentName =
    user?.apartment_name ||
    sessionStorage.getItem('onboarding_apartment_name') ||
    '우리 아파트';

  const nickname =
    user?.nickname ||
    sessionStorage.getItem('onboarding_nickname') ||
    user?.email?.split('@')[0] ||
    '이웃';

  // 통계 로드
  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try {
        const data = await userService.getStats();
        setStats(data);
      } catch (_) {
        // 실패해도 기본값 표시
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  // 내 글 로드
  const loadMyPosts = async () => {
    try {
      const data = await requestService.myPosts();
      setMyPosts(data);
    } catch (_) {}
  };

  // 내가 도움 준 글 로드
  const loadMyHelped = async () => {
    try {
      const data = await requestService.myHelped();
      setMyHelped(data);
    } catch (_) {}
  };

  const handleMenuClick = async (label) => {
    if (label === '내가 올린 글') {
      await loadMyPosts();
      setView('my_posts');
    } else if (label === '내가 참여한 글') {
      await loadMyHelped();
      setView('my_helped');
    } else if (label === '채팅 내역') {
      navigate('/chat');
    } else if (label === '계정 설정') {
      setView('settings');
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (settingsForm.newPassword !== settingsForm.newPasswordConfirm) {
      setSettingsMsg('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const { authService } = await import('@/services/api');
      await authService.changePassword({
        currentPassword: settingsForm.currentPassword,
        newPassword: settingsForm.newPassword,
      });
      setSettingsMsg('비밀번호가 변경되었습니다.');
      setSettingsForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    } catch (e) {
      setSettingsMsg(e.message || '변경 실패');
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    try {
      const { authService } = await import('@/services/api');
      await authService.deleteAccount();
      logout();
    } catch (e) {
      alert(e.message || '탈퇴 실패');
    }
  };

  const menuSections = [
    {
      title: '내 활동',
      items: [
        { icon: FileText,      label: '내가 올린 글',   count: stats.my_posts  || 0 },
        { icon: CheckSquare,   label: '내가 참여한 글', count: stats.my_helped || 0 },
        { icon: MessageCircle, label: '채팅 내역',       count: null },
      ],
    },
    {
      title: '계정',
      items: [
        { icon: Settings, label: '계정 설정', count: null },
      ],
    },
  ];

  // ── 서브 뷰: 내가 올린 글 ─────────────────────────────────────────────────
  if (view === 'my_posts') {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => setView('main')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-[18px] font-bold">내가 올린 글</h1>
        </header>
        <div className="px-5 pb-32 space-y-3">
          {myPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-4">📝</span>
              <p className="text-[16px] font-semibold text-foreground">아직 올린 글이 없어요</p>
              <p className="text-[14px] text-muted-foreground mt-1">이웃에게 도움을 요청해보세요</p>
            </div>
          ) : myPosts.map((post) => (
            <div key={post.id} className="rounded-[16px] bg-card p-4 border border-border shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <p className="text-[15px] font-semibold text-foreground mt-2 leading-snug line-clamp-2">
                    {post.title}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">{post.time_ago}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                  post.status === 'waiting'    ? 'bg-blue-50 text-blue-600'   :
                  post.status === 'connecting' ? 'bg-orange-50 text-orange-600' :
                  post.status === 'done'       ? 'bg-green-50 text-green-600' :
                                                 'bg-gray-100 text-gray-500'
                }`}>
                  {post.status === 'waiting' ? '대기중' : post.status === 'connecting' ? '연결중' : post.status === 'done' ? '완료' : '종료'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 서브 뷰: 내가 참여한 글 ───────────────────────────────────────────────
  if (view === 'my_helped') {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => setView('main')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-[18px] font-bold">내가 참여한 글</h1>
        </header>
        <div className="px-5 pb-32 space-y-3">
          {myHelped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-4">🤝</span>
              <p className="text-[16px] font-semibold text-foreground">아직 참여한 글이 없어요</p>
              <p className="text-[14px] text-muted-foreground mt-1">이웃을 도와보세요!</p>
            </div>
          ) : myHelped.map((post) => (
            <div key={post.id} className="rounded-[16px] bg-card p-4 border border-border shadow-sm">
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {post.category}
              </span>
              <p className="text-[15px] font-semibold text-foreground mt-2 leading-snug line-clamp-2">
                {post.title}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">{post.time_ago}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 서브 뷰: 계정 설정 ────────────────────────────────────────────────────
  if (view === 'settings') {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => { setView('main'); setSettingsMsg(''); }} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-[18px] font-bold">계정 설정</h1>
        </header>
        <div className="px-5 pb-32 space-y-5">

          {/* 계정 정보 */}
          <div className="rounded-[16px] bg-card p-5 border border-border shadow-sm">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">계정 정보</p>
            <p className="text-[14px] text-foreground">이메일: <span className="font-medium">{user?.email}</span></p>
            <p className="text-[14px] text-foreground mt-1">닉네임: <span className="font-medium">{nickname}</span></p>
            <p className="text-[14px] text-foreground mt-1">아파트: <span className="font-medium">{apartmentName}</span></p>
          </div>

          {/* 비밀번호 변경 */}
          <div className="rounded-[16px] bg-card p-5 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-[14px] font-semibold">비밀번호 변경</p>
            </div>
            <div className="space-y-3">
              {[
                { key: 'currentPassword', placeholder: '현재 비밀번호' },
                { key: 'newPassword', placeholder: '새 비밀번호' },
                { key: 'newPasswordConfirm', placeholder: '새 비밀번호 확인' },
              ].map(({ key, placeholder }) => (
                <input
                  key={key}
                  type="password"
                  placeholder={placeholder}
                  value={settingsForm[key]}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full h-12 px-4 rounded-[12px] border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              ))}
              {settingsMsg && (
                <p className={`text-[13px] ${settingsMsg.includes('변경') ? 'text-green-600' : 'text-destructive'}`}>
                  {settingsMsg}
                </p>
              )}
              <button
                onClick={handleChangePassword}
                className="w-full h-12 rounded-[12px] bg-primary text-white text-[14px] font-semibold active:scale-95 transition-all"
              >
                비밀번호 변경
              </button>
            </div>
          </div>

          {/* 회원 탈퇴 */}
          <div className="rounded-[16px] bg-card p-5 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-4 h-4 text-destructive" />
              <p className="text-[14px] font-semibold text-destructive">회원 탈퇴</p>
            </div>
            <p className="text-[13px] text-muted-foreground mb-4">탈퇴 시 모든 데이터가 영구 삭제됩니다.</p>
            <button
              onClick={handleDeleteAccount}
              className="w-full h-11 rounded-[12px] border border-destructive text-destructive text-[14px] font-semibold active:scale-95 transition-all"
            >
              탈퇴하기
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── 메인 뷰 ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-background">

      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight font-heading">
              마이단지
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">나의 활동과 단지 정보</p>
          </div>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
            onClick={async () => {
              try {
                await userService.markAllNotificationsRead();
              } catch (_) {}
            }}
          >
            <Bell className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div className="px-5 pb-32 space-y-4">

        {/* 프로필 카드 */}
        <div
          className="relative overflow-hidden rounded-[20px] p-6"
          style={{
            background: 'linear-gradient(135deg, #FDFCF8 0%, #FFF8F2 100%)',
            border: '1px solid rgba(255,138,61,0.18)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1">우리단지</p>
              <p className="text-[15px] font-bold text-foreground tracking-tight">{apartmentName}</p>
            </div>
            <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(255,138,61,0.12)', color: '#C05A1F' }}>
              인증 완료
            </div>
          </div>

          <div className="mb-4" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,138,61,0.25) 0%, transparent 100%)' }} />

          <div className="mb-4">
            <p className="text-[22px] font-bold text-foreground tracking-tight leading-tight">{nickname}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">입주민</p>
          </div>

          <p className="text-[12px] font-medium" style={{ color: '#C05A1F' }}>
            함께한 기록이 쌓이고 있어요 ✦
          </p>
        </div>

        {/* 활동 통계 */}
        <div className="rounded-[20px] p-4 bg-card" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid hsl(var(--border))' }}>
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { label: '도움 준 횟수', value: loadingStats ? '...' : `${stats.help_count}` },
              { label: '감사 받은 수', value: loadingStats ? '...' : `${stats.thanks_count}` },
              { label: '매너 온도',    value: loadingStats ? '...' : `${stats.manner_temp}°` },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-2 py-1">
                <p className="text-[20px] font-bold" style={{ color: '#FF8A3D' }}>{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 메뉴 섹션 */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              {section.title}
            </p>
            <div className="rounded-[20px] bg-card overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid hsl(var(--border))' }}>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleMenuClick(item.label)}
                    className={`w-full flex items-center gap-3.5 px-5 py-4 hover:bg-secondary/50 transition-colors ${idx > 0 ? 'border-t border-border' : ''}`}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-left text-[15px] font-medium">{item.label}</span>
                    {item.count !== null && (
                      <span className="text-[13px] font-semibold text-primary mr-1">{item.count}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={logout}
          className="flex items-center gap-2 px-1 py-3 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>

      </div>
    </div>
  );
}
