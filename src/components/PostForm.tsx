'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaImage } from 'react-icons/fa';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface PostFormProps {
  initialData?: {
    title: string;
    content: string;
    description: string;
    keywords: string[];
    featuredImage?: {
      url: string;
      alt: string;
      credit?: {
        name: string;
        url: string;
      };
    };
  };
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function PostForm({ initialData, onSubmit, isSubmitting }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [imageUrl, setImageUrl] = useState(initialData?.featuredImage?.url || '');
  const [imageAlt, setImageAlt] = useState(initialData?.featuredImage?.alt || '');
  const [creditName, setCreditName] = useState(initialData?.featuredImage?.credit?.name || '');
  const [creditUrl, setCreditUrl] = useState(initialData?.featuredImage?.credit?.url || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      description,
      keywords,
      featuredImage: imageUrl ? {
        url: imageUrl,
        alt: imageAlt,
        credit: creditName ? {
          name: creditName,
          url: creditUrl
        } : undefined
      } : undefined
    };

    await onSubmit(postData);
  };

  const handleKeywordAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const handleKeywordDelete = (keywordToDelete: string) => {
    setKeywords(keywords.filter(k => k !== keywordToDelete));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="포스트 제목을 입력하세요"
        />
      </div>

      {/* 설명 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          설명
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="포스트에 대한 간단한 설명을 입력하세요"
        />
      </div>

      {/* 키워드 */}
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
          키워드
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleKeywordDelete(keyword)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          id="keywords"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={handleKeywordAdd}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="키워드를 입력하고 Enter를 누르세요"
        />
      </div>

      {/* 대표 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대표 이미지
        </label>
        <div className="space-y-4">
          <div>
            <label htmlFor="imageUrl" className="block text-sm text-gray-600 mb-1">이미지 URL</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이미지 URL을 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="imageAlt" className="block text-sm text-gray-600 mb-1">대체 텍스트</label>
            <input
              type="text"
              id="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이미지 대체 텍스트를 입력하세요"
            />
          </div>
          <div>
            <label htmlFor="creditName" className="block text-sm text-gray-600 mb-1">크레딧 - 이름</label>
            <input
              type="text"
              id="creditName"
              value={creditName}
              onChange={(e) => setCreditName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이미지 제작자/제공자 이름"
            />
          </div>
          <div>
            <label htmlFor="creditUrl" className="block text-sm text-gray-600 mb-1">크레딧 - URL</label>
            <input
              type="url"
              id="creditUrl"
              value={creditUrl}
              onChange={(e) => setCreditUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이미지 제작자/제공자 페이지 URL"
            />
          </div>
        </div>
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용
        </label>
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={(value) => setContent(value || '')}
            height={400}
          />
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </form>
  );
} 