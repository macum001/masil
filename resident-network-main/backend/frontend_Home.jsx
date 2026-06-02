import React, { useEffect, useState, useCallback } from 'react';
import { Search, Bell, X } from 'lucide-react';
import RequestCard from '../components/home/RequestCard';
import WriteBottomSheet from '../components/home/WriteBottomSheet';
import WritePost from './WritePost';
import PostDetail from './PostDetail';
import { requestService } from '@/services/api';
import { useAuth } from '@/lib/AuthContext';

const categories = [
  { id: 'all',      label: '전체' },
  { id: 'walk',     label: '산책' },
  { id: 'delivery', label: '전달' },
  { id: 'shopping', label: '장보기' },
  { id: 'care',     label: '돌봄' },
  { id: 'share',    label: '나눔' },
  { id: 'etc',      label: '기타' },
];

const catMap = {
  walk: '산책', delivery: '전달', shopping: '장보기',
  care: '돌봄', share: '나눔', etc: '기타',
};

const gratitudeLabelMap = {
  available: 'yes', none: 'no', give: 'give', excluded: null,
};

function mapRequest(row) {
  return {
    id:        row.id,
    post_type: row.post_type,
    category:  row.category,
    title:     row.title,
    content:   row.content,
    location:  row.apartment_name ? `${row.apartment_name}` : row.location_text || '',
    timeAgo:   row.time_ago || '방금 전',
    gratitude: row.gratitude_type === 'excluded' ? null
             : row.gratitude_type === 'available' ? 'yes'
             : row.gratitude_type === 'none'      ? 'no'
             : row.gratitude_type === 'give'      ? 'give'
             : null,
    status:    row.status || 'waiting',
    user_id:   row.user_id,
    nickname:  row.nickname,
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

  const apartmentName =
    user?.apartment_name ||
    sessionStorage.getItem('onboarding_apartment_name') ||
    '우리 아파트';

  const loadPosts = useCallback(async (categoryId = 'all', search = '') => {
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

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
  };

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

  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={() => { setSelectedPost(null); loadPosts(activeCategory, searchQuery); }} />;
  }

  if (postType) {
    return <WritePost postType={postType} onSubmit={handleSubmit} onBack={() => setPostType(null)} />;
  }

  return (
    <div className="flex flex-col min-h-full relative">

      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <p className="text-[12px] font-semibold text-primary tracking-widest uppercase mb-0.5">우리단지</p>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight leading-none font-heading">
              {apartmentName}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
            >
              <Search className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
            </button>
            <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary active:scale-90 transition-all">
              <Bell className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* 검색창 (토글) */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="px-5 pb-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="제목 또는 내용 검색..."
                className="w-full h-11 pl-9 pr-9 rounded-[12px] border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {searchInput && (
                <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button type="submit" className="px-4 h-11 rounded-[12px] bg-primary text-white text-[13px] font-semibold shrink-0">
              검색
            </button>
          </form>
        )}

        {searchQuery && !searchOpen && (
          <div className="px-5 pb-2 flex items-center gap-2">
            <span className="text-[13px] text-primary font-medium">"{searchQuery}" 검색 결과</span>
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
                  onClick={() => handleCategoryChange(cat.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-chip text-[14px] font-medium whitespace-nowrap transition-all active:scale-95"
                  style={isActive
                    ? { background: '#5D7B6F', color: '#fff', boxShadow: '0 4px 12px rgba(93,123,111,0.28)' }
                    : { background: '#fff', color: '#8A8A8E', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                  }
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── 섹션 레이블 ── */}
      <div className="px-6 pb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-foreground tracking-tight">
          {searchQuery
            ? `"${searchQuery}" 검색 결과`
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

      {/* ── 카드 목록 ── */}
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

      {/* ── 글쓰기 버튼 ── */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-28 right-5 z-40 flex items-center gap-2 px-5 h-14 rounded-button active:scale-95 transition-all"
        style={{
          background: '#FF8A3D',
          boxShadow: '0 8px 28px rgba(255,138,61,0.40)',
          maxWidth: 'calc(512px - 20px)',
          color: '#fff',
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        ✦ 이웃에게 부탁하기
      </button>

      <WriteBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectType={handleSelectType}
      />
    </div>
  );
}
