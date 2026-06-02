import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatRoom from './ChatRoom';
import { chatService } from '@/services/api';

export default function Chat() {
  const [activeChat, setActiveChat] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await chatService.listRooms();
      setRooms(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (activeChat) {
    return (
      <ChatRoom
        chat={activeChat}
        onBack={() => setActiveChat(null)}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-background">

      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-[22px] font-bold text-foreground">
            채팅
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            이웃과의 대화
          </p>
        </div>
      </header>

      {loading ? (
        <div className="p-6">
          채팅방 불러오는 중...
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-5">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>

          <p className="text-[16px] font-semibold text-foreground mb-1">
            아직 채팅이 없어요
          </p>

          <p className="text-[14px] text-muted-foreground text-center">
            이웃의 요청에 연결하면
            <br />
            채팅이 시작돼요
          </p>
        </div>
      ) : (
        <div className="px-4 pt-2 pb-32 space-y-2">

          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveChat(room)}
              className="w-full flex items-start gap-3.5 p-4 rounded-card bg-card text-left"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">
                💬
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">

                  <span className="text-[15px] font-semibold text-foreground">
                 {room.title ? room.title : `채팅방 #${room.id}`}
                  </span>

                </div>

                <p className="text-[13px] text-muted-foreground mt-1">
                  {room.last_message ? room.last_message : `요청번호 #${room.request_id}`}
              </p>
              </div>
            </button>
          ))}

        </div>
      )}
    </div>
  );
}