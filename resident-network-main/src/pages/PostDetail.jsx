import React from 'react';
import { ChevronLeft, MapPin, Clock, User } from 'lucide-react';

const statusConfig = {
  waiting: { label: '대기중', bg: 'rgba(93,123,111,0.10)', color: '#5D7B6F' },
  connecting: { label: '연결중', bg: 'rgba(255,138,61,0.12)', color: '#FF8A3D' },
  done: { label: '완료', bg: 'rgba(142,142,147,0.12)', color: '#8E8E93' },
  closed: { label: '마감', bg: 'rgba(142,142,147,0.12)', color: '#8E8E93' },
};

const gratitudeLabel = {
  yes: '있어요',
  no: '없어요',
  give: '드려요',
};

const ctaLabel = {
  together: '같이 가능해요',
  request: '도움 가능해요',
  share: '나눔 받을게요',
  default: '채팅하기',
};

function parseImages(imageUrl) {
  if (!imageUrl) return [];

  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return imageUrl ? [imageUrl] : [];
  }
}

export default function PostDetail({ post, onBack }) {
  const status = statusConfig[post.status];
  const isClosed = post.status === 'done' || post.status === 'closed';
  const cta = ctaLabel[post.post_type] ?? ctaLabel.default;
  const images = parseImages(post.image_url);

  console.log(post);
console.log(images);

  const handleApply = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `http://localhost:4000/api/requests/${post.id}/applications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: '도움 신청합니다.',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('신청 실패');
      }

      alert('도움 신청 완료');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('도움 신청 실패');
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
          </button>
          <h1 className="text-[17px] font-bold text-foreground tracking-tight">요청 상세</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-40 space-y-0">
        <div className="mb-3">
          <span
            className="text-[12px] font-semibold px-3 py-1.5 rounded-badge"
            style={{ background: 'rgba(93,123,111,0.10)', color: '#5D7B6F' }}
          >
            {post.category}
          </span>
        </div>

        <h2 className="text-[22px] font-bold text-foreground leading-snug tracking-tight mb-4">
          {post.title}
        </h2>

        <div className="flex flex-col gap-1.5 mb-6">
          <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <User className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span>{post.location} 이웃</span>
          </div>
          <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span>{post.timeAgo}</span>
          </div>
        </div>

        <Divider />

        {images.length > 0 && (
          <>
            <div className="space-y-3">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:4000${img}`}
                  alt=""
                  className="w-full h-auto rounded-xl border shadow-sm"
                />
              ))}
            </div>
            <Divider />
          </>
        )}

        {post.content ? (
          <InfoBlock label="요청 내용">
            <p className="text-[15px] text-foreground leading-relaxed">{post.content}</p>
          </InfoBlock>
        ) : (
          <InfoBlock label="요청 내용">
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              작성된 내용이 없어요. 채팅으로 직접 문의해보세요.
            </p>
          </InfoBlock>
        )}

        <Divider />

        <InfoBlock label="위치 범위">
          <div className="flex items-center gap-1.5 text-[15px] text-foreground">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.6} />
            {post.locationRange ?? post.location ?? '단지 전체'}
          </div>
        </InfoBlock>

        <Divider />

        <InfoBlock label="가능 시간">
          <div className="flex items-center gap-1.5 text-[15px] text-foreground">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.6} />
            {post.time ?? '시간 협의'}
          </div>
        </InfoBlock>

        {post.gratitude && post.gratitude !== 'excluded' && (
          <>
            <Divider />
            <InfoBlock label="감사비용">
              <span
                className="text-[14px] font-semibold px-3 py-1.5 rounded-badge inline-block"
                style={
                  post.gratitude === 'yes' || post.gratitude === 'give'
                    ? { background: 'rgba(255,138,61,0.12)', color: '#FF8A3D' }
                    : { background: 'rgba(142,142,147,0.10)', color: '#8E8E93' }
                }
              >
                {gratitudeLabel[post.gratitude] ?? post.gratitude}
              </span>
            </InfoBlock>
          </>
        )}

        <Divider />

        <InfoBlock label="상태">
          {status && (
            <span
              className="text-[14px] font-semibold px-3 py-1.5 rounded-badge inline-flex items-center gap-1.5"
              style={{ background: status.bg, color: status.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
              {status.label}
            </span>
          )}
        </InfoBlock>
      </div>

      <div className="fixed bottom-20 left-0 right-0 max-w-lg mx-auto px-5 pb-4 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent z-50">
        <button
          disabled={isClosed}
          onClick={handleApply}
          className="w-full h-14 rounded-[18px] text-[16px] font-bold transition-all active:scale-[0.98]"
          style={
            isClosed
              ? { background: '#E5E5EA', color: '#AEAEB2', cursor: 'not-allowed' }
              : { background: '#FF8A3D', color: '#fff', boxShadow: '0 8px 28px rgba(255,138,61,0.38)' }
          }
        >
          {isClosed ? '마감된 요청이에요' : cta}
        </button>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border/50 my-5" />;
}

function InfoBlock({ label, children }) {
  return (
    <div className="py-1">
      <p className="text-[12px] font-semibold text-muted-foreground tracking-wide uppercase mb-2">{label}</p>
      {children}
    </div>
  );
}