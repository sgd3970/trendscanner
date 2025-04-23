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
  imageUrl: string;
  imageSource: string;
  videoUrl: string;
  images: ImageData[];
}

export default function NewCoupangPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    imageUrl: '',
    imageSource: '',
    videoUrl: '',
    images: [],
  });

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        imageUrl: data.url,
        imageSource: '',
        images: []
      }));
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setFormData(prev => {
      const updatedImages = [...prev.images, ...newImages];
      const firstImage = updatedImages[0];
      return {
        ...prev,
        imageUrl: firstImage?.url || '',
        imageSource: firstImage?.source || '',
        images: updatedImages
      };
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageSourceChange = (index: number, source: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, source } : img
      )
    }));
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            대표 이미지
          </label>
          <div className="mt-1 space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            {formData.imageUrl && (
              <figure className="my-6">
                <div className="relative w-full pt-[56.25%]">
                  <Image
                    src={formData.imageUrl}
                    alt="대표 이미지"
                    fill
                    className="object-cover rounded-xl shadow-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={formData.imageSource}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageSource: e.target.value }))}
                    placeholder="예: Unsplash / 쿠팡 상품 이미지 / 브랜드 공식"
                    className="block w-full text-sm text-gray-500 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formData.imageSource && (
                    <figcaption className="mt-1 text-xs text-gray-400 text-center">
                      출처: {formData.imageSource}
                    </figcaption>
                  )}
                </div>
              </figure>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            추가 이미지
          </label>
          <div className="mt-1">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <div className="mt-4 space-y-6">
              {formData.images.map((image, index) => (
                <figure key={index} className="relative group">
                  <div className="relative w-full pt-[56.25%]">
                    <Image
                      src={image.url}
                      alt={`Additional image ${index + 1}`}
                      fill
                      className="object-cover rounded-xl shadow-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={image.source}
                      onChange={(e) => handleImageSourceChange(index, e.target.value)}
                      placeholder="예: Unsplash / 쿠팡 상품 이미지 / 브랜드 공식"
                      className="block w-full text-sm text-gray-500 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {image.source && (
                      <figcaption className="mt-1 text-xs text-gray-400 text-center">
                        출처: {image.source}
                      </figcaption>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
            YouTube 영상 URL (선택사항)
          </label>
          <div className="mt-1">
            <input
              type="url"
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              YouTube 영상 URL만 지원됩니다.
            </p>
          </div>
          {formData.videoUrl && (
            <div className="mt-4">
              {getYouTubeEmbedUrl(formData.videoUrl) ? (
                <div className="relative w-full pt-[56.25%]">
                  <iframe
                    src={getYouTubeEmbedUrl(formData.videoUrl) || ''}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                  />
                </div>
              ) : (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                  유효한 YouTube URL이 아닙니다.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
} 