import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '@/services/api';
import { ChevronLeft, Send, ChevronDown } from 'lucide-react';

const systemMessages = (hasGratitude) => [
  {
    id: 'sys-1',
    type: 'system',
    text: '따뜻하게 시작해볼까요?\n시간과 방법은 편하게 대화로 정해요.',
  },
  ...(hasGratitude ? [{
    id: 'sys-2',
    type: 'system',
    text: '감사 표현은 서로 편하게 이야기해 주세요.',
  }] : []),
  {
    id: 'sys-3',
    type: 'system',
    text: '⚠️ 호수, 상세 주소, 전화번호 공유는 신중하게 해주세요.\n가능하면 단지 내 공용 공간에서 만나세요.',
    isWarning: true,
  },
];

const initialMessages = (hasGratitude) => [
  ...systemMessages(hasGratitude),
  {
    id: 'm-1',
    type: 'other',
    text: '안녕하세요! 요청 보고 연락드려요 😊',
    time: '오후 6:52',
  },
  {
    id: 'm-2',
    type: 'me',
    text: '안녕하세요! 반갑습니다.',
    time: '오후 6:53',
  },
];

export default function ChatRoom({ chat, onBack }) {
  const hasGratitude = chat.gratitude === 'yes' || chat.gratitude === 'give';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showPostSummary, setShowPostSummary] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

useEffect(() => {
  loadMessages();
}, []);

const loadMessages = async () => {
  try {
    const data = await chatService.getMessages(chat.id);

    if (data.length === 0) {
      setMessages(initialMessages(hasGratitude));
      return;
    }

    setMessages(
      data.map((msg) => ({
        id: msg.id,
        type: 'me',
        text: msg.message,
        time: '',
      }))
    );
  } catch (error) {
    console.error(error);
  }
};

  const handleSend = async () => {
  const text = input.trim();
  if (!text) return;

  try {
    await chatService.sendMessage(chat.id, text);

    setInput('');
    await loadMessages();
  } catch (error) {
    console.error(error);
    alert('메시지 전송 실패');
  }
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">

      {/* Header */}
      <header className="flex-shrink-0 bg-background/90 backdrop-blur-xl border-b border-border/40 z-20">
        <div className="flex items-center gap-3 px-4 pt-5 pb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex-1 min-w-0">

            <p className="text-[16px] font-bold text-foreground tracking-tight truncate">
  {chat.title || chat.name || `채팅방 #${chat.id}`}
</p>

           <p className="text-[12px] text-muted-foreground truncate">
  요청번호 #{chat.request_id}
</p>

          </div>
          <button
            onClick={() => setShowPostSummary((v) => !v)}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronDown
              className="w-4 h-4 text-muted-foreground transition-transform"
              style={{ transform: showPostSummary ? 'rotate(180deg)' : 'rotate(0deg)' }}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* Post summary expandable */}
        {showPostSummary && (
          <div className="mx-4 mb-3 p-3.5 rounded-[14px] bg-secondary">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">{chat.category}</p>
            <p className="text-[14px] font-semibold text-foreground leading-snug">{chat.postTitle}</p>
            {chat.location && (
              <p className="text-[12px] text-muted-foreground mt-1">{chat.location}</p>
            )}
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div
                  className="max-w-[88%] px-4 py-3 rounded-[14px] text-center"
                  style={msg.isWarning
                    ? { background: 'rgba(255,138,61,0.09)', border: '1px solid rgba(255,138,61,0.22)' }
                    : { background: 'rgba(93,123,111,0.08)', border: '1px solid rgba(93,123,111,0.15)' }
                  }
                >
                  <p
                    className="text-[13px] leading-relaxed whitespace-pre-line"
                    style={{ color: msg.isWarning ? '#C0632A' : '#5D7B6F' }}
                  >
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          }

          if (msg.type === 'other') {
            return (
              <div key={msg.id} className="flex items-end gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base flex-shrink-0"
                >
                  {chat.avatar}
                </div>
                <div className="max-w-[72%]">
                  <div
                    className="px-4 py-3 rounded-[18px] rounded-bl-[6px]"
                    style={{ background: '#F2F2F7' }}
                  >
                    <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-line">{msg.text}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 ml-1">{msg.time}</p>
                </div>
              </div>
            );
          }

          // me
          return (
            <div key={msg.id} className="flex items-end justify-end gap-2">
              <div className="max-w-[72%] flex flex-col items-end">
                <div
                  className="px-4 py-3 rounded-[18px] rounded-br-[6px]"
                  style={{ background: '#FF8A3D' }}
                >
                  <p className="text-[15px] text-white leading-relaxed whitespace-pre-line">{msg.text}</p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 mr-1">{msg.time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex-shrink-0 px-4 pb-8 pt-3 bg-background border-t border-border/40"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 bg-secondary rounded-[18px] px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed"
            placeholder="메시지를 입력하세요"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={input.trim()
              ? { background: '#FF8A3D', boxShadow: '0 4px 14px rgba(255,138,61,0.35)' }
              : { background: '#E5E5EA' }
            }
          >
            <Send
              className="w-4 h-4"
              style={{ color: input.trim() ? '#fff' : '#AEAEB2' }}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </div>
  );
}