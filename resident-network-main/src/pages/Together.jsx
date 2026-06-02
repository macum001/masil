import React from 'react';
import AppHeader from '../components/layout/AppHeader';
import ContentCard from '../components/common/ContentCard';
import StatusBadge from '../components/common/StatusBadge';
import { Users } from 'lucide-react';

const togetherPosts = [
  {
    id: 1,
    category: '산책',
    title: '주말 아침 조깅 같이 해요 🏃',
    description: '토요일 오전 7시, 단지 정문 앞 집합. 3km 코스!',
    author: '201동 김건강',
    timeAgo: '1시간 전',
    status: 'open',
  },
  {
    id: 2,
    category: '장보기',
    title: '이번 주 목요일 하나로마트 같이 갈 분',
    description: '차로 같이 가요! 2명 자리 남았어요.',
    author: '103동 이나래',
    timeAgo: '3시간 전',
    status: 'open',
    gratitudeAmount: null,
  },
];

export default function Together() {
  return (
    <div className="flex flex-col">
      <AppHeader title="함께해요" showNotification />

      {/* Info Banner */}
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

      {/* Post List */}
      <div className="px-5 pt-4 pb-6 space-y-3">
        {togetherPosts.map((post) => (
          <ContentCard
            key={post.id}
            category={post.category}
            title={post.title}
            description={post.description}
            author={post.author}
            timeAgo={post.timeAgo}
            status={post.status}
            gratitudeAmount={post.gratitudeAmount}
          />
        ))}
      </div>
    </div>
  );
}