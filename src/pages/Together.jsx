import React, { useEffect, useState, useCallback } from 'react';
import { Users, Search, X } from 'lucide-react';
import RequestCard from '../components/home/RequestCard';
import WritePost from './WritePost';
import PostDetail from './PostDetail';
import { requestService } from '@/services/api';

function mapPost(row) {
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

export default function Together() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [postType, setPostType] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const load = useCallback(async (search) => {
    setLoading(true);
    try {
      const data = await requestService.list({ post_type: 'together', search: search || undefined });
      setPosts(data.map(mapPost));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(searchQuery); }, [searchQuery, load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleSubmit = async (formData) => {
    setPostType(null);
    try {
      await requestService.create({ ...formData, post_type: 'together' });
      await load(searchQuery);
    } catch (error) {
      alert(error.message || '글 저장 실패');
    }
  };

  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={() => { setSelectedPost(null); load(searchQuery); }} />;
  }

  if (postType) {
    return <WritePost postType="together" onSubmit={handleSubmit} onBack={() => setPostType(null)} />;
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-30 glass-header">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight font-heading">함께해요</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">이웃과 함께할 거리를 찾아보세요</p>
        </div>
      </header>

      {/* 배너 */}
      <div className="mx-5 mt-3 p-4 rounded-card"
        style={{ background: 'linear-gradient(145deg, hsl(222 16% 16%) 0%, hsl(222 18% 12%) 100%)', border: '1px solid hsl(222 12% 24%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(80,200,160,0.16)' }}>
            <Users className="w-5 h-5" style={{ color: 'hsl(162 48% 60%)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">이웃과 함께하면 더 즐거워요</p>
            <p className="text-xs text-muted-foreground mt-0.5">산책, 장보기, 운동 등 함께할 이웃을 찾아보세요</p>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="mx-5 mt-3 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="함께하기 검색..."
          className="w-full h-12 pl-10 pr-10 rounded-[12px] bg-secondary text-foreground text-[14px] outline-none focus:ring-2 focus:ring-primary/30"
        />
        {searchInput && (
          <button type="button" onClick={() => { setSearchInput(''); setSearchQuery(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </form>

      {/* 목록 */}
      <div className="px-5 pt-4 pb-32 space-y-3">
        {loading ? (
          <p className="text-center text-[13px] text-muted-foreground py-10">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-4">🤝</span>
            <p className="text-[16px] font-semibold text-foreground">아직 함께하기 글이 없어요</p>
            <p className="text-[14px] text-muted-foreground mt-1">첫 번째 함께하기를 만들어보세요!</p>
          </div>
        ) : posts.map((post) => (
          <RequestCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
        ))}
      </div>

      {/* 글쓰기 버튼 */}
      <button
        onClick={() => setPostType('together')}
        className="fixed bottom-28 right-5 z-40 flex items-center gap-2 px-5 h-14 rounded-button active:scale-95 transition-all"
        style={{
          background: 'linear-gradient(135deg, hsl(162 52% 56%) 0%, hsl(172 50% 46%) 100%)',
          boxShadow: '0 8px 28px rgba(80,200,160,0.4)',
          maxWidth: 'calc(512px - 20px)',
        }}
      >
        <Users className="w-5 h-5" style={{ color: 'hsl(222 18% 9%)' }} />
        <span className="text-[15px] font-semibold" style={{ color: 'hsl(222 18% 9%)' }}>함께하기 만들기</span>
      </button>
    </div>
  );
}
