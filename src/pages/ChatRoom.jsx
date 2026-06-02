import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatService, fileService } from '@/services/api';
import { useAuth } from '@/lib/AuthContext';
import { ChevronLeft, Send, ChevronDown, ImagePlus, Smile } from 'lucide-react';

const EMOJIS = ['😊', '👍', '🙏', '❤️', '😂', '🎉', '👏', '🤝', '😅', '🥰', '😭', '🔥', '✨', '💪', '🙌', '😉'];

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${ampm} ${h}:${m}`;
}

function isImageMsg(text) {
  return typeof text === 'string' && text.startsWith('[img]');
}
function imgUrl(text) {
  const u = text.replace('[img]', '');
  return u.startsWith('http') ? u : `http://localhost:4000${u}`;
}

export default function ChatRoom({ chat, onBack }) {
  const { user } = useAuth();
  const myId = Number(user?.id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showPostSummary, setShowPostSummary] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatService.getMessages(chat.id);
      if (!data) { setMessages([]); return; }
      const msgs = data.map((msg) => ({
        id: msg.id,
        mine: Number(msg.sender_id) === myId,   // ★ 내가 보낸 것인지
        text: msg.message,
        time: formatTime(msg.created_at),
      }));
      setMessages(msgs);
    } catch (error) {
      console.error(error);
    }
  }, [chat.id, myId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendText = async (text) => {
    if (!text || sending) return;
    setSending(true);
    try {
      await chatService.sendMessage(chat.id, text);
      await loadMessages();
    } catch (error) {
      alert('메시지 전송 실패');
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setShowEmoji(false);
    await sendText(text);
  };

  const handleEmoji = async (emoji) => {
    setShowEmoji(false);
    await sendText(emoji);
  };

  const handleImage = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setSending(true);
    try {
      const urls = await fileService.upload(files);
      for (const url of urls) {
        await chatService.sendMessage(chat.id, `[img]${url}`);
      }
      await loadMessages();
    } catch (error) {
      alert('이미지 전송 실패: ' + (error.message || ''));
    } finally {
      setSending(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherName = myId === Number(chat.requester_id)
    ? (chat.helper_nickname || chat.helper_name || '이웃')
    : (chat.requester_nickname || chat.requester_name || '이웃');

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <header className="flex-shrink-0 glass-header z-20">
        <div className="flex items-center gap-3 px-4 pt-5 pb-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-foreground tracking-tight truncate">{otherName}</p>
            <p className="text-[12px] text-muted-foreground truncate">{chat.title || `요청 #${chat.request_id}`}</p>
          </div>
          <button onClick={() => setShowPostSummary((v) => !v)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" style={{ transform: showPostSummary ? 'rotate(180deg)' : 'rotate(0deg)' }} strokeWidth={1.8} />
          </button>
        </div>
        {showPostSummary && (
          <div className="mx-4 mb-3 p-3.5 rounded-[14px] bg-secondary">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(162 48% 60%)' }}>{chat.category}</p>
            <p className="text-[14px] font-semibold text-foreground leading-snug">{chat.title}</p>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          // ───── 내가 보낸 메시지: 오른쪽 ─────
          if (msg.mine) {
            return (
              <div key={msg.id} className="flex items-end justify-end gap-2">
                <div className="flex flex-col items-end" style={{ maxWidth: '72%' }}>
                  {isImageMsg(msg.text) ? (
                    <img src={imgUrl(msg.text)} alt="" className="rounded-[16px] max-w-full" style={{ maxHeight: '240px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }} />
                  ) : (
                    <div className="px-4 py-3 rounded-[18px] rounded-br-[6px]" style={{ background: 'linear-gradient(135deg, #6D8DF5 0%, #7B6EF6 100%)', boxShadow: '0 4px 16px rgba(109,141,245,0.38)' }}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: '#FFFFFF', fontWeight: 500 }}>{msg.text}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1 mr-1">{msg.time}</p>
                </div>
              </div>
            );
          }

          // ───── 상대방 메시지: 왼쪽 ─────
          return (
            <div key={msg.id} className="flex items-end justify-start gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base flex-shrink-0">💬</div>
              <div className="flex flex-col items-start" style={{ maxWidth: '72%' }}>
                {isImageMsg(msg.text) ? (
                  <img src={imgUrl(msg.text)} alt="" className="rounded-[16px] max-w-full" style={{ maxHeight: '240px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }} />
                ) : (
                  <div className="px-4 py-3 rounded-[18px] rounded-bl-[6px]" style={{ background: 'hsl(222 14% 22%)' }}>
                    <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-line">{msg.text}</p>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-1 ml-1">{msg.time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 이모티콘 패널 */}
      {showEmoji && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-border/40" style={{ background: 'hsl(222 16% 13%)' }}>
          <div className="grid grid-cols-8 gap-2">
            {EMOJIS.map((emo) => (
              <button key={emo} onClick={() => handleEmoji(emo)} className="text-[24px] h-10 rounded-lg hover:bg-white/5 active:scale-90 transition-all">
                {emo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 pb-8 pt-3 border-t border-border/40" style={{ background: 'hsl(222 18% 9%)', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-end gap-2">
          {/* 이미지 첨부 */}
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImage} />
          <button onClick={() => fileRef.current?.click()} disabled={sending}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary active:scale-90 transition-all">
            <ImagePlus className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
          </button>
          {/* 이모티콘 */}
          <button onClick={() => setShowEmoji((v) => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary active:scale-90 transition-all">
            <Smile className="w-5 h-5" style={{ color: showEmoji ? 'hsl(162 48% 60%)' : 'hsl(220 8% 58%)' }} strokeWidth={1.8} />
          </button>

          <textarea
            className="flex-1 bg-secondary rounded-[18px] px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed"
            placeholder="메시지를 입력하세요"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowEmoji(false)}
            style={{ maxHeight: '120px' }}
          />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={input.trim() ? { background: 'linear-gradient(135deg, #6D8DF5 0%, #7B6EF6 100%)', boxShadow: '0 4px 14px rgba(109,141,245,0.45)' } : { background: 'hsl(222 14% 22%)' }}>
            <Send className="w-4 h-4" style={{ color: input.trim() ? '#FFFFFF' : 'hsl(220 8% 50%)' }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
