import React, { useEffect, useState } from 'react';
import { ChevronLeft, Bell, CheckCheck } from 'lucide-react';
import { userService } from '@/services/api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export default function Notifications({ onBack }) {
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
                  <p className="text-[11px] text-muted-foreground mt-1.5">{timeAgo(n.created_at)}</p>
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
