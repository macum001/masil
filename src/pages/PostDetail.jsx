import React, { useState } from 'react';
import { ChevronLeft, MapPin, Clock, User } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast, confirmDialog } from '@/components/Dialog';
import { chatService } from '@/services/api';
import ChatRoom from './ChatRoom';
import { MessageCircle } from 'lucide-react';

const TOKEN_KEY = 'masil_access_token';
const API = 'http://localhost:4000/api';

const statusConfig = {
  waiting:    { label: '대기중', bg: 'rgba(0,0,0,0.06)',   color: '#1A1A1A' },
  connecting: { label: '연결중', bg: 'rgba(34,139,87,0.12)', color: '#228B57' },
  done:       { label: '완료',   bg: 'rgba(142,142,147,0.12)', color: '#8E8E93' },
  closed:     { label: '마감',   bg: 'rgba(142,142,147,0.12)', color: '#8E8E93' },
};

const gratitudeLabel = { yes: '있어요', no: '없어요', give: '드려요' };

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(post.status);
  const [chatRoom, setChatRoom] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  const handleStartChat = async () => {
    setChatLoading(true);
    try {
      const room = await chatService.startChat(post.id);
      const full = await chatService.getRoom(room.id);
      setChatRoom(full);
    } catch (error) {
      toast(error.message || '채팅 시작 실패', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const status = statusConfig[currentStatus];
  const isClosed = currentStatus === 'done' || currentStatus === 'closed';
  const cta = ctaLabel[post.post_type] ?? ctaLabel.default;
  const images = parseImages(post.image_url);

  // 내가 쓴 글인지 확인
  const isMyPost = user?.id === post.user_id;

  const token = () => localStorage.getItem(TOKEN_KEY);

  // 도움 신청 (남의 글)
  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/requests/${post.id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ message: '도움 신청합니다.' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || '신청 실패');
      toast('도움 신청 완료! 채팅에서 대화를 시작하세요.', 'success');
      setCurrentStatus('connecting');
    } catch (error) {
      toast(error.message || '도움 신청 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 도움 완료 처리 (내 글)
  const handleComplete = async () => {
    const ok = await confirmDialog({
      title: '도움 완료',
      message: '도움이 완료되었나요? 완료하면 도와준 이웃의 매너온도가 올라가요.',
      confirmText: '완료하기',
      cancelText: '취소',
    });
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/requests/${post.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status: 'done' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || '완료 처리 실패');
      toast('도움 완료! 감사 인사가 전달되었어요 😊', 'success');
      setCurrentStatus('done');
    } catch (error) {
      toast(error.message || '완료 처리 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (chatRoom) {
    return <ChatRoom chat={chatRoom} onBack={() => setChatRoom(null)} />;
  }

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

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-40">
        <div className="mb-3">
          <span className="text-[12px] font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.06)', color: '#1A1A1A' }}>
            {post.category}
          </span>
        </div>

        <h2 className="text-[22px] font-bold text-foreground leading-snug tracking-tight mb-4">
          {post.title}
        </h2>

        <div className="flex flex-col gap-1.5 mb-6">
          <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <User className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span>{post.nickname || post.location || '이웃'}</span>
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
                <img key={idx} src={img.startsWith('http') ? img : `http://localhost:4000${img}`}
                  alt="" className="w-full h-auto rounded-xl border shadow-sm" />
              ))}
            </div>
            <Divider />
          </>
        )}

        <InfoBlock label="요청 내용">
          <p className="text-[15px] text-foreground leading-relaxed">
            {post.content || '작성된 내용이 없어요. 채팅으로 직접 문의해보세요.'}
          </p>
        </InfoBlock>

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
              <span className="text-[14px] font-semibold px-3 py-1.5 rounded-full inline-block"
                style={{ background: 'rgba(0,0,0,0.06)', color: '#1A1A1A' }}>
                {gratitudeLabel[post.gratitude] ?? post.gratitude}
              </span>
            </InfoBlock>
          </>
        )}

        <Divider />

        <InfoBlock label="상태">
          {status && (
            <span className="text-[14px] font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
              style={{ background: status.bg, color: status.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
              {status.label}
            </span>
          )}
        </InfoBlock>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 max-w-lg mx-auto px-5 pb-4 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent z-50">
        {isMyPost ? (
          // 내 글: 도움 완료 버튼
          <button
            disabled={isClosed || loading}
            onClick={handleComplete}
            className="w-full h-14 rounded-[18px] text-[16px] font-bold transition-all active:scale-[0.98]"
            style={
              currentStatus === 'done'
                ? { background: 'hsl(222 14% 20%)', color: 'hsl(220 8% 45%)', cursor: 'not-allowed' }
                : { background: 'linear-gradient(135deg, hsl(162 52% 56%) 0%, hsl(172 50% 46%) 100%)', color: 'hsl(222 18% 9%)' }
            }
          >
            {loading ? '처리 중...' : currentStatus === 'done' ? '완료된 요청이에요' : '✓ 도움 완료 처리하기'}
          </button>
        ) : (
          // 남의 글: 채팅하기 + 도움 신청
          <div className="flex gap-2.5">
            <button
              disabled={chatLoading}
              onClick={handleStartChat}
              className="flex items-center justify-center gap-1.5 h-14 px-5 rounded-[18px] text-[15px] font-bold transition-all active:scale-[0.98]"
              style={{ background: 'hsl(222 14% 20%)', color: '#fff', minWidth: '120px' }}
            >
              <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
              {chatLoading ? '여는 중...' : '채팅하기'}
            </button>
            <button
              disabled={isClosed || loading}
              onClick={handleApply}
              className="flex-1 h-14 rounded-[18px] text-[16px] font-bold transition-all active:scale-[0.98]"
              style={
                isClosed
                  ? { background: 'hsl(222 14% 20%)', color: 'hsl(220 8% 45%)', cursor: 'not-allowed' }
                  : { background: 'linear-gradient(135deg, hsl(162 52% 56%) 0%, hsl(172 50% 46%) 100%)', color: 'hsl(222 18% 9%)' }
              }
            >
              {loading ? '처리 중...' : isClosed ? '마감됨' : cta}
            </button>
          </div>
        )}
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
