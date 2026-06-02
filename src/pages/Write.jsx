import React, { useState, useRef } from 'react';
import { toast } from '@/components/Dialog';

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
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews].slice(0, 5));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('masil_access_token');
      const categoryLabel = postCategories.find((c) => c.id === selectedCategory)?.label || selectedCategory;

      let imageUrls = [];

      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => {
  formData.append('images', img.file);
});

        const uploadResponse = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
  imageUrls = uploadResult.imageUrls || [];
}
      }

      const response = await fetch('http://localhost:4000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          category: categoryLabel,
          image_url: JSON.stringify(imageUrls),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || '등록 실패');
      }

      toast('등록 완료!', 'success');
      window.location.href = '/';
    } catch (error) {
      console.error(error);
      toast(error.message || '등록 실패', 'error');
    }
  };

  return (
    <div className="flex flex-col">
      <AppHeader title="글쓰기" showNotification={false} />

      <div className="px-5 py-4 space-y-6">
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

        <FormInput
          label="제목"
          placeholder="무엇을 부탁하시나요?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={40}
        />

        <FormInput
          label="내용"
          placeholder="자세한 내용을 적어주세요. 시간, 장소, 기타 조건 등"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={5}
          maxLength={500}
        />

        <div className="space-y-2.5">
          <label className="block text-sm font-semibold text-foreground">사진 첨부</label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px] font-medium">{images.length}/5</span>
          </button>

          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.preview}
                  alt=""
                  className="w-20 h-20 object-cover rounded-xl border"
                />
              ))}
            </div>
          )}
        </div>

        <PrimaryButton
          fullWidth
          disabled={!selectedCategory || !title}
          onClick={handleSubmit}
        >
          올리기
        </PrimaryButton>
      </div>
    </div>
  );
}