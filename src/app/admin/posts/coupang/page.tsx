'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ImageData {
  url: string;
  source: string;
}

interface PostFormData {
  title: string;
  content: string;
  thumbnailUrl: string;
  videoUrl: string;
  images: ImageData[];
}

export default function NewCoupangPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    thumbnailUrl: '',
    videoUrl: '',
    images: [],
  });
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: 'coupang',
          thumbnailUrl: formData.images[0]?.url || '',
        }),
      });

      if (!response.ok) {
        throw new Error('포스트 생성에 실패했습니다.');
      }

      router.push('/admin/posts');
    } catch (error) {
      console.error('포스트 생성 오류:', error);
      alert('포스트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageData[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('이미지 업로드에 실패했습니다.');
        }

        const data = await response.json();
        newImages.push({ url: data.url, source: '' });
      } catch (error) {
        console.error('이미지 업로드 오류:', error);
        alert('이미지 업로드 중 오류가 발생했습니다.');
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
      thumbnailUrl: prev.images.length === 0 && newImages.length > 0 ? newImages[0].url : prev.thumbnailUrl
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        thumbnailUrl: index === 0 && newImages.length > 0 ? newImages[0].url : prev.thumbnailUrl
      };
    });
  };

  const handleVideoUrlChange = (url: string) => {
    const embedUrl = getYouTubeEmbedUrl(url);
    setFormData(prev => ({ ...prev, videoUrl: url }));
    setVideoPreview(embedUrl);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      } else if (urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">쿠팡 포스트 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
            유튜브 영상 URL (선택사항)
          </label>
          <input
            type="url"
            id="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {videoPreview && (
            <div className="mt-2 aspect-video">
              <iframe
                src={videoPreview}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            이미지 업로드
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesUpload}
            className="mt-1 block w-full"
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={image.url}
                  alt={`업로드된 이미지 ${index + 1}`}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  ✕
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                    대표 이미지
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            내용
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
} 