import React from 'react';
import { X } from 'lucide-react';

const POST_TYPES = [
  {
    id: 'together',
    emoji: '🤝',
    title: '함께해요 올리기',
    desc: '같이 산책, 장보기, 운동 등 함께할 이웃을 찾아요',
  },
  {
    id: 'request',
    emoji: '🙌',
    title: '도움 요청하기',
    desc: '작은 도움이 필요할 때 이웃에게 연결해요',
  },
  {
    id: 'share',
    emoji: '🎁',
    title: '나눔 올리기',
    desc: '물건, 음식, 정보를 이웃과 나눠요',
  },
];

export default function WriteBottomSheet({ open, onClose, onSelectType }) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
        style={{ animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}
      >
        <div
          className="bg-card rounded-t-[28px] px-6 pt-5 pb-10"
          style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
        >
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-foreground tracking-tight">무엇을 올릴까요?</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3">
            {POST_TYPES.map((type) => (
              <button
                key={type.id}
                className="w-full flex items-center gap-4 p-4 rounded-[18px] bg-secondary active:scale-[0.98] transition-all text-left"
                onClick={() => onSelectType(type.id)}
              >
                <span className="text-2xl w-11 h-11 flex-shrink-0 flex items-center justify-center bg-card rounded-[14px] shadow-sm">
                  {type.emoji}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{type.title}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
}