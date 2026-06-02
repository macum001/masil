import React, { useEffect, useState } from 'react';
import AppHeader from '../components/layout/AppHeader';
import ContentCard from '../components/common/ContentCard';
import WritePost from './WritePost';
import PostDetail from './PostDetail';
import { Users, Search } from 'lucide-react';
import { requestService } from '@/services/api';

function mapPost(row) {
  return {
    id: row.id,
    post_type: row.post_type,
    category: row.category,
    title: row.title,
    description: row.content || '',
    author: row.nickname || row.name || '이웃',
    timeAgo: row.time_ago || '방금 전',
    status: row.status,
    gratitudeAmount: row.gratitude_type === 'excluded' ? null : row.gratitude_type,
  };
}

export default function Together() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [postType, setPostType] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const load = async (keyword = '') => {
    setLoading(true);
    try {
      const data = await requestService.list({ post_type: 'together', search: keyword });
      setPosts(data.map(mapPost));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    load(searchInput);
  };

  const handleSubmit = async (formData) => {
    setPostType(null);
    try {
      await requestService.create({ ...formData, post_type: 'together' });
      await load(search);
    } catch (e) {
      alert(e.message || '글 저장 실패');
    }
  };

  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  if (postType) {
    return <WritePost postType="together" onSubmit={handleSubmit} onBack={() => setPostType(null)} />;
  }

  const filtered = search
    ? posts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader title="함께해요" showNotification />

      {/* 배너 */}
      <div className="mx-5 mt-3 p-4 bg-accent rounded-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
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
          className="w-full h-12 pl-10 pr-4 rounded-[12px] border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </form>

      {/* 목록 */}
      <div className="px-5 pt-4 pb-32 space-y-3">
        {loading ? (
          <p className="text-center text-[13px] text-muted-foreground py-10">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-4">🤝</span>
            <p className="text-[16px] font-semibold text-foreground">아직 함께하기 글이 없어요</p>
            <p className="text-[14px] text-muted-foreground mt-1">첫 번째 함께하기를 만들어보세요!</p>
          </div>
        ) : filtered.map((post) => (
          <ContentCard
            key={post.id}
            category={post.category}
            title={post.title}
            description={post.description}
            author={post.author}
            timeAgo={post.timeAgo}
            status={post.status}
            gratitudeAmount={post.gratitudeAmount}
            onClick={() => setSelectedPost(post)}
          />
        ))}
      </div>

      {/* 글쓰기 버튼 */}
      <button
        onClick={() => setPostType('together')}
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
        <Users className="w-5 h-5" />
        함께하기 만들기
      </button>
    </div>
  );
}
