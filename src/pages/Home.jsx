import React, { useEffect, useState, useCallback } from 'react';
import { Search, Bell, X, ChevronLeft, CheckCheck } from 'lucide-react';
import RequestCard from '../components/home/RequestCard';
import WriteBottomSheet from '../components/home/WriteBottomSheet';
import WritePost from './WritePost';
import PostDetail from './PostDetail';
import { requestService, userService } from '@/services/api';
import { useAuth } from '@/lib/AuthContext';

const categories = [
  { id: 'all', label: '전체' },
  { id: 'walk', label: '산책' },
  { id: 'delivery', label: '전달' },
  { id: 'shopping', label: '장보기' },
  { id: 'care', label: '돌봄' },
  { id: 'share', label: '나눔' },
  { id: 'etc', label: '기타' },
];

const catMap = {
  walk: '산책', delivery: '전달', shopping: '장보기',
  care: '돌봄', share: '나눔', etc: '기타',
};

function mapRequest(row) {
  return {
    id: row.id,
    post_type: row.post_type,
    category: row.category,
    title: row.title,
    content: row.content,
    location: row.apartment_name || row.location_text || '우리 단지',
    locationRange: row.location_range,
    time: row.preferred_time,
    timeAgo: row.time_ago || '방금 전',
    gratitude: row.gratitude_type === 'excluded' ? null
             : row.gratitude_type === 'available' ? 'yes'
             : row.gratitude_type === 'none' ? 'no'
             : row.gratitude_type === 'give' ? 'give'
             : row.gratitude_type,
    status: row.status || 'waiting',
    user_id: row.user_id,
    nickname: row.nickname,
    image_url: row.image_url || null,
  };
}

export default function Home() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [postType, setPostType] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);

  const apartmentName = user?.apartment_name || '우리 아파트';

  const loadPosts = useCallback(async (categoryId, search) => {
    setLoadingPosts(true);
    setPostsError('');
    try {
      const data = await requestService.list({
        category: categoryId !== 'all' ? catMap[categoryId] : undefined,
        post_type: 'request',
        search: search || undefined,
      });
      setPosts(data.map(mapRequest));
    } catch (error) {
      setPostsError(error.message || '요청글을 불러오지 못했습니다.');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(activeCategory, searchQuery);
  }, [activeCategory, searchQuery, loadPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleSelectType = (type) => {
    setSheetOpen(false);
    setPostType(type);
  };

  const handleSubmit = async (formData) => {
    setPostType(null);
    try {
      await requestService.create(formData);
      await loadPosts(activeCategory, searchQuery);
    } catch (error) {
      alert(error.message || '글 저장에 실패했습니다.');
    }
  };

  if (showNotif) {
    return <NotificationView onBack={() => setShowNotif(false)} />;
  }

  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={() => { setSelectedPost(null); loadPosts(activeCategory, searchQuery); }} />;
  }

  if (postType) {
    return <WritePost postType={postType} onSubmit={handleSubmit} onBack={() => setPostType(null)} />;
  }

  return (
    <div className="flex flex-col min-h-full relative">

      {/* Header */}
      <header className="sticky top-0 z-30 glass-header">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <p className="text-[12px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: 'hsl(162 48% 58%)' }}>
              우리단지
            </p>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight leading-none font-heading">
              {apartmentName}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all"
            >
              <Search className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
            </button>
            <button onClick={() => setShowNotif(true)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all">
              <Bell className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* 검색창 */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="px-5 pb-3 flex gap-2 animate-fade-up">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="제목 또는 내용 검색..."
                className="w-full h-11 pl-9 pr-9 rounded-[12px] bg-secondary text-foreground text-[14px] outline-none focus:ring-2 focus:ring-primary/30"
              />
              {searchInput && (
                <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button type="submit" className="px-4 h-11 rounded-[12px] text-[13px] font-semibold shrink-0"
              style={{ background: 'hsl(162 48% 52%)', color: 'hsl(222 18% 9%)' }}>
              검색
            </button>
          </form>
        )}

        {searchQuery && !searchOpen && (
          <div className="px-5 pb-2 flex items-center gap-2">
            <span className="text-[13px] font-medium" style={{ color: 'hsl(162 48% 58%)' }}>"{searchQuery}" 검색 결과</span>
            <button onClick={handleClearSearch}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* 카테고리 칩 */}
        <div className="pb-4">
          <div className="flex gap-2 overflow-x-auto px-6" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-chip text-[14px] font-medium whitespace-nowrap transition-all active:scale-95"
                  style={isActive
                    ? { background: 'hsl(162 48% 52%)', color: 'hsl(222 18% 9%)', boxShadow: '0 4px 12px rgba(80,200,160,0.3)' }
                    : { background: 'hsl(222 14% 18%)', color: 'hsl(220 8% 65%)' }
                  }
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Section label */}
      <div className="px-6 pb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-foreground tracking-tight">
          {searchQuery ? `"${searchQuery}" 검색 결과`
            : activeCategory === 'all' ? '최근 요청' : `${catMap[activeCategory]} 요청`}
        </h2>
        <span className="text-[13px] text-muted-foreground font-medium">{posts.length}건</span>
      </div>

      {postsError && (
        <div className="mx-5 mb-3 rounded-[16px] bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          {postsError}
        </div>
      )}
      {loadingPosts && (
        <div className="mx-5 mb-3 rounded-[16px] bg-secondary px-4 py-3 text-[13px] text-muted-foreground">
          불러오는 중...
        </div>
      )}

      {/* Card list */}
      <div className="px-5 pb-36 space-y-3">
        {!loadingPosts && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-4">🏡</span>
            <p className="text-[16px] font-semibold text-foreground">
              {searchQuery ? '검색 결과가 없어요' : '아직 요청이 없어요'}
            </p>
            <p className="text-[14px] text-muted-foreground mt-1">
              {searchQuery ? '다른 검색어를 입력해보세요' : '첫 번째로 이웃에게 연결해보세요'}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <RequestCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))
        )}
      </div>

      {/* Floating Write Button */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-28 right-5 z-40 flex items-center gap-2 px-5 h-14 rounded-button active:scale-95 transition-all"
        style={{
          background: 'linear-gradient(135deg, hsl(162 52% 56%) 0%, hsl(172 50% 46%) 100%)',
          boxShadow: '0 8px 28px rgba(80,200,160,0.4)',
          maxWidth: 'calc(512px - 20px)',
        }}
      >
        <span className="text-xl font-light leading-none" style={{ color: 'hsl(222 18% 9%)' }}>+</span>
        <span className="text-[15px] font-semibold" style={{ color: 'hsl(222 18% 9%)' }}>이웃과 연결하기</span>
      </button>

      <WriteBottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSelectType={handleSelectType} />
    </div>
  );
}


// ── 알림 화면 (인라인 컴포넌트) ──
function notifTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

function NotificationView({ onBack }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await userService.getNotifications();
      setList(data || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReadAll = async () => {
    try {
      await userService.readAllNotifications();
      setList((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {}
  };

  const handleRead = async (id) => {
    try {
      await userService.readNotification(id);
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch {}
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-30 glass-header">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
          </button>
          <h1 className="flex-1 text-[18px] font-bold text-foreground tracking-tight">알림</h1>
          {list.some((n) => !n.is_read) && (
            <button onClick={handleReadAll} className="flex items-center gap-1 text-[13px] font-medium" style={{ color: '#9DB2F8' }}>
              <CheckCheck className="w-4 h-4" />
              모두 읽음
            </button>
          )}
        </div>
      </header>

      <div className="px-5 pt-4 pb-32 space-y-2">
        {loading ? (
          <p className="text-center text-[13px] text-muted-foreground py-10">불러오는 중...</p>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-[16px] font-semibold text-foreground mb-1">아직 알림이 없어요</p>
            <p className="text-[14px] text-muted-foreground">도움 신청이나 완료 소식이 여기 표시돼요</p>
          </div>
        ) : (
          list.map((n) => (
            <button
              key={n.id}
              onClick={() => handleRead(n.id)}
              className="w-full text-left rounded-[16px] p-4 transition-all active:scale-[0.99]"
              style={{
                background: n.is_read ? 'hsl(222 16% 13%)' : 'rgba(109,141,245,0.10)',
                border: n.is_read ? '1px solid hsl(222 12% 22%)' : '1px solid rgba(109,141,245,0.3)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: n.is_read ? 'hsl(222 14% 20%)' : 'rgba(109,141,245,0.2)' }}>
                  🔔
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground">{n.title}</p>
                  {n.body && <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>}
                  <p className="text-[11px] text-muted-foreground mt-1.5">{notifTimeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#6D8DF5' }} />}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
