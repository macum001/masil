import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import RequestCard from '../components/home/RequestCard';
import WriteBottomSheet from '../components/home/WriteBottomSheet';
import WritePost from './WritePost';
import PostDetail from './PostDetail';

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

const statusMap = {
  together: 'waiting',
  request: 'waiting',
  share: 'waiting',
};

const gratitudeLabelMap = {
  available: 'yes',
  none: 'no',
  give: 'give',
  excluded: null,
};

const initialPosts = [
  {
    id: 1,
    category: '장보기',
    title: '편의점 가시는 이웃 계시면 생수 하나 부탁드려도 될까요?',
    location: '래미안 대치팰리스 103동',
    timeAgo: '10분 전',
    gratitude: 'yes',
    status: 'waiting',
  },
  {
    id: 2,
    category: '산책',
    title: '퇴근 후 반려견 산책 같이 하실 분 구해요!',
    location: '래미안 대치팰리스 201동',
    timeAgo: '25분 전',
    gratitude: 'no',
    status: 'waiting',
  },
  {
    id: 3,
    category: '전달',
    title: '오후 3시에 오는 택배 대신 받아주실 수 있나요?',
    location: '래미안 대치팰리스 305동',
    timeAgo: '1시간 전',
    gratitude: 'give',
    status: 'connecting',
  },
  {
    id: 4,
    category: '돌봄',
    title: '내일 오전 2시간만 아이 봐주실 분 계신가요?',
    location: '래미안 대치팰리스 108동',
    timeAgo: '2시간 전',
    gratitude: 'yes',
    status: 'waiting',
  },
  {
    id: 5,
    category: '나눔',
    title: '아이 옷 나눔합니다 (3~5세 여아 기준)',
    location: '래미안 대치팰리스 502동',
    timeAgo: '3시간 전',
    gratitude: 'no',
    status: 'done',
  },
  {
    id: 6,
    category: '장보기',
    title: '코스트코 가시는 분 계시면 계란 한 판 부탁드려요',
    location: '래미안 대치팰리스 212동',
    timeAgo: '4시간 전',
    gratitude: 'give',
    status: 'closed',
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState(initialPosts);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [postType, setPostType] = useState(null);   // null = list, string = write
  const [selectedPost, setSelectedPost] = useState(null); // null = list, object = detail

  const filtered = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === catMap[activeCategory]);

  const handleSelectType = (type) => {
    setSheetOpen(false);
    setPostType(type);
  };

  const handleSubmit = (formData) => {
    const newPost = {
      id: Date.now(),
      category: formData.category,
      title: formData.title,
      location: `래미안 대치팰리스 · ${formData.location}`,
      timeAgo: '방금 전',
      gratitude: gratitudeLabelMap[formData.gratitude_type] ?? null,
      status: statusMap[formData.post_type] ?? 'waiting',
    };
    setPosts((prev) => [newPost, ...prev]);
    setPostType(null);
  };

  // Detail view
  if (selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  // Write flow view
  if (postType) {
    return (
      <WritePost
        postType={postType}
        onSubmit={handleSubmit}
        onBack={() => setPostType(null)}
      />
    );
  }

  // Home list view
  return (
    <div className="flex flex-col min-h-full relative">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <p className="text-[12px] font-semibold text-primary tracking-widest uppercase mb-0.5">
              우리단지
            </p>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight leading-none font-heading">
              래미안 대치팰리스
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary active:scale-90 transition-all">
              <Search className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
            </button>
            <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary active:scale-90 transition-all">
              <Bell className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="pb-4">
          <div
            className="flex gap-2 overflow-x-auto px-6"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
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

      {/* ── Section label ── */}
      <div className="px-6 pb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-foreground tracking-tight">
          {activeCategory === 'all' ? '최근 요청' : `${catMap[activeCategory] ?? '전체'} 요청`}
        </h2>
        <span className="text-[13px] text-muted-foreground font-medium">{filtered.length}건</span>
      </div>

      {/* ── Card list ── */}
      <div className="px-5 pb-36 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-4">🏡</span>
            <p className="text-[16px] font-semibold text-foreground">아직 요청이 없어요</p>
            <p className="text-[14px] text-muted-foreground mt-1">첫 번째로 이웃에게 연결해보세요</p>
          </div>
        ) : (
          filtered.map((post) => (
            <RequestCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))
        )}
      </div>

      {/* ── Floating Write Button ── */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-28 right-5 z-40 flex items-center gap-2 px-5 h-14 rounded-button active:scale-95 transition-all"
        style={{
          background: '#FF8A3D',
          boxShadow: '0 8px 28px rgba(255,138,61,0.40)',
          maxWidth: 'calc(512px - 20px)',
        }}
      >
        <span className="text-white text-xl font-light leading-none">+</span>
        <span className="text-white text-[15px] font-semibold">이웃과 연결하기</span>
      </button>

      {/* ── Write Type Sheet ── */}
      <WriteBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectType={handleSelectType}
      />
    </div>
  );
}