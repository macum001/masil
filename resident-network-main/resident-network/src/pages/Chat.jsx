import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatRoom from './ChatRoom';

const sampleChats = [
  {
    id: 1,
    name: '101동 김주민',
    avatar: '🙂',
    postTitle: '편의점 가시는 이웃 계시면 생수 하나 부탁드려도 될까요?',
    category: '장보기',
    location: '래미안 대치팰리스 103동',
    lastMessage: '네, 지금 바로 가능해요!',
    timeAgo: '방금',
    unread: 2,
    gratitude: 'yes',
  },
  {
    id: 2,
    name: '203동 이하영',
    avatar: '😊',
    postTitle: '오후 3시에 오는 택배 대신 받아주실 수 있나요?',
    category: '전달',
    location: '래미안 대치팰리스 305동',
    lastMessage: '택배 잘 받았습니다. 감사합니다!',
    timeAgo: '10분 전',
    unread: 0,
    gratitude: 'give',
  },
  {
    id: 3,
    name: '305동 박서연',
    avatar: '🤗',
    postTitle: '코스트코 가시는 분 계시면 계란 한 판 부탁드려요',
    category: '장보기',
    location: '래미안 대치팰리스 212동',
    lastMessage: '계란 2판이면 될까요?',
    timeAgo: '1시간 전',
    unread: 1,
    gratitude: 'yes',
  },
];

export default function Chat() {
  const [activeChat, setActiveChat] = useState(null);

  if (activeChat) {
    return <ChatRoom chat={activeChat} onBack={() => setActiveChat(null)} />;
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight font-heading">채팅</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">이웃과의 대화</p>
        </div>
      </header>

      {sampleChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-5">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-[16px] font-semibold text-foreground mb-1">아직 채팅이 없어요</p>
          <p className="text-[14px] text-muted-foreground text-center">
            이웃의 요청에 연결하면<br />채팅이 시작돼요
          </p>
        </div>
      ) : (
        <div className="px-4 pt-2 pb-32 space-y-2">
          {sampleChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className="w-full flex items-start gap-3.5 p-4 rounded-card bg-card active:scale-[0.985] transition-all text-left"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                {chat.avatar}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[15px] font-semibold text-foreground">{chat.name}</span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">{chat.timeAgo}</span>
                </div>
                <p className="text-[12px] text-primary font-medium truncate mb-1">{chat.postTitle}</p>
                <p className="text-[14px] text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>

              {/* Unread badge */}
              {chat.unread > 0 && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#FF8A3D' }}
                >
                  <span className="text-[10px] font-bold text-white">{chat.unread}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}