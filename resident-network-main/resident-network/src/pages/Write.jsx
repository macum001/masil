import React, { useState } from 'react';
import AppHeader from '../components/layout/AppHeader';
import CategoryChip from '../components/common/CategoryChip';
import FormInput from '../components/common/FormInput';
import PrimaryButton from '../components/common/PrimaryButton';
import { Camera } from 'lucide-react';

const postCategories = [
  { id: 'walk', label: '산책', icon: '🚶' },
  { id: 'delivery', label: '전달', icon: '📦' },
  { id: 'shopping', label: '장보기', icon: '🛒' },
  { id: 'help', label: '도움', icon: '🤝' },
  { id: 'share', label: '나눔', icon: '🎁' },
];

export default function Write() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className="flex flex-col">
      <AppHeader title="글쓰기" showNotification={false} />

      <div className="px-5 py-4 space-y-6">
        {/* Category Selection */}
        <div className="space-y-2.5">
          <label className="block text-sm font-semibold text-foreground">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {postCategories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                isActive={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <FormInput
          label="제목"
          placeholder="무엇을 부탁하시나요?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={40}
        />

        {/* Content */}
        <FormInput
          label="내용"
          placeholder="자세한 내용을 적어주세요. 시간, 장소, 기타 조건 등"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={5}
          maxLength={500}
        />

        {/* Photo Upload Placeholder */}
        <div className="space-y-2.5">
          <label className="block text-sm font-semibold text-foreground">사진 첨부</label>
          <button className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
            <Camera className="w-5 h-5" />
            <span className="text-[10px] font-medium">0/5</span>
          </button>
        </div>

        {/* Submit */}
        <PrimaryButton fullWidth disabled={!selectedCategory || !title}>
          올리기
        </PrimaryButton>
      </div>
    </div>
  );
}