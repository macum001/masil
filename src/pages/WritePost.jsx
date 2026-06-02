import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Camera } from 'lucide-react';

const POST_TYPE_LABEL = {
  together: '함께해요',
  request: '도움 요청',
  share: '나눔',
};

const CATEGORIES = ['산책', '전달', '장보기', '돌봄', '나눔', '기타'];

const LOCATIONS = [
  '단지 전체',
  '우리 동만',
  '인근 2개 동',
];

const TIMES = [
  '지금 당장',
  '오늘 중',
  '이번 주 중',
  '날짜 협의',
];

const GRATITUDE_OPTIONS = [
  { id: 'available', label: '있어요', desc: '감사의 마음을 전달해요' },
  { id: 'none', label: '없어요', desc: '마음만으로 충분해요' },
  { id: 'give', label: '드려요', desc: '내가 먼저 드릴게요' },
];

export default function WritePost({ postType, onSubmit, onBack }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    content: '',
    location: '단지 전체',
    time: '지금 당장',
    gratitude: 'available',
  });

  const isTogether = postType === 'together';
  const typeLabel = POST_TYPE_LABEL[postType] ?? '글';

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const canSubmit = form.title.trim() && form.category;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      post_type: postType,
      ...form,
      gratitude_type: isTogether ? 'excluded' : form.gratitude,
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-header">
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex-1">
            <p className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: 'hsl(162 48% 58%)' }}>{typeLabel}</p>
            <h1 className="text-[18px] font-bold text-foreground tracking-tight leading-tight">글 올리기</h1>
          </div>
        </div>
      </header>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-40 space-y-6">

        {/* Title */}
        <Section label="제목" required>
          <input
            className="w-full bg-secondary rounded-[16px] px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition"
            placeholder="이웃들이 쉽게 이해할 수 있는 제목을 써주세요"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            maxLength={60}
          />
        </Section>

        {/* Category */}
        <Section label="카테고리" required>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => set('category', cat)}
                className="px-4 py-2 rounded-chip text-[14px] font-medium transition-all active:scale-95"
                style={form.category === cat
                  ? { background: 'hsl(162 48% 52%)', color: 'hsl(222 18% 9%)', boxShadow: '0 4px 12px rgba(80,200,160,0.3)' }
                  : { background: 'hsl(222 14% 18%)', color: 'hsl(220 8% 65%)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </Section>

        {/* Content */}
        <Section label="내용">
          <textarea
            className="w-full bg-secondary rounded-[16px] px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
            placeholder="이웃에게 좀 더 자세히 설명해주세요 (선택)"
            rows={4}
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
            maxLength={300}
          />
          <p className="text-right text-[12px] text-muted-foreground mt-1">{form.content.length}/300</p>
        </Section>

        {/* Location */}
        <Section label="위치 범위">
          <div className="flex gap-2 flex-wrap">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => set('location', loc)}
                className="px-4 py-2 rounded-chip text-[14px] font-medium transition-all active:scale-95"
                style={form.location === loc
                  ? { background: 'hsl(162 48% 52%)', color: 'hsl(222 18% 9%)', boxShadow: '0 4px 12px rgba(80,200,160,0.3)' }
                  : { background: 'hsl(222 14% 18%)', color: 'hsl(220 8% 65%)' }
                }
              >
                {loc}
              </button>
            ))}
          </div>
        </Section>

        {/* Time */}
        <Section label="가능 시간">
          <div className="flex gap-2 flex-wrap">
            {TIMES.map((t) => (
              <button
                key={t}
                onClick={() => set('time', t)}
                className="px-4 py-2 rounded-chip text-[14px] font-medium transition-all active:scale-95"
                style={form.time === t
                  ? { background: 'hsl(162 48% 52%)', color: 'hsl(222 18% 9%)', boxShadow: '0 4px 12px rgba(80,200,160,0.3)' }
                  : { background: 'hsl(222 14% 18%)', color: 'hsl(220 8% 65%)' }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        {/* Gratitude — excluded for 'together' type */}
        {!isTogether && (
          <Section label="감사비용">
            <div className="grid grid-cols-3 gap-2">
              {GRATITUDE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => set('gratitude', opt.id)}
                  className="flex flex-col items-center gap-1.5 p-3.5 rounded-[16px] transition-all active:scale-95"
                  style={form.gratitude === opt.id
                    ? { background: 'rgba(80,200,160,0.14)', border: '1.5px solid hsl(162 48% 52%)' }
                    : { background: 'hsl(222 14% 18%)', border: '1.5px solid transparent' }
                  }
                >
                  <span
                    className="text-[15px] font-bold"
                    style={{ color: form.gratitude === opt.id ? 'hsl(162 48% 60%)' : 'hsl(220 15% 85%)' }}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground text-center leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Photo */}
        <Section label="사진 (선택)">
          <button className="w-full h-[80px] rounded-[16px] bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
            <Camera className="w-5 h-5 text-muted-foreground" strokeWidth={1.6} />
            <span className="text-[13px] text-muted-foreground">사진 추가하기</span>
          </button>
        </Section>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-5 pb-10 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent z-30">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-14 rounded-button text-[16px] font-bold transition-all active:scale-[0.98]"
          style={canSubmit
            ? { background: 'linear-gradient(135deg, hsl(162 52% 56%) 0%, hsl(172 50% 46%) 100%)', color: 'hsl(222 18% 9%)', boxShadow: '0 8px 28px rgba(80,200,160,0.4)' }
            : { background: 'hsl(222 14% 20%)', color: 'hsl(220 8% 45%)', cursor: 'not-allowed' }
          }
        >
          이웃과 연결하기
        </button>
      </div>
    </div>
  );
}

function Section({ label, required, children }) {
  return (
    <div>
      <p className="text-[14px] font-semibold text-foreground mb-2.5">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </p>
      {children}
    </div>
  );
}