'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaEye, FaHeart } from 'react-icons/fa';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';

// 마크다운 문법 제거 함수
function removeMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거
    .replace(/\[.*?\]\(.*?\)/g, '') // 링크 제거
    .replace(/#{1,6}\s?/g, '') // 제목 문법 제거
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // 볼드 처리 제거
    .replace(/(\*|_)(.*?)\1/g, '$2') // 이탤릭 처리 제거
    .replace(/~~.*?~~/g, '') // 취소선 제거
    .replace(/`{1,3}.*?`{1,3}/g, '') // 코드 블록 제거
    .replace(/\n/g, ' ') // 줄바꿈을 공백으로 변경
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로 변경
    .trim();
}

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  keywords: string[];
  views: number;
  likes: number;
  imageUrl?: string;
  gptImageUrl?: string;
  featuredImage?: {
    url: string;
    alt: string;
    credit?: {
      name: string;
      url: string;
    };
  };
  slug?: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('포스트를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 pt-16 sm:pt-20 pb-8 sm:pb-12">
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="제목, 내용, 키워드로 검색"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative w-full pt-[56.25%] bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-16 sm:pt-20 pb-8 sm:pb-12">
        {/* 검색 섹션 */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="제목, 내용, 키워드로 검색"
          />
        </div>

        {/* 포스트 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPosts.map(post => (
            <Link
              key={post._id}
              href={`/post/${post.slug || post._id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
            >
              {/* 이미지 배경 */}
              <div className="relative w-full pt-[56.25%]">
                <Image
                  src={post.imageUrl || '/images/default-post-image.jpg'}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onError={(e) => {
                    console.error('이미지 로드 실패:', post.imageUrl);
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.src = '/images/default-post-image.jpg';
                  }}
                />
              </div>

              {/* 텍스트 콘텐츠 */}
              <div className="p-4 flex flex-col flex-grow">
                {/* 키워드 태그 */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                {/* 제목 */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                
                {/* 요약 내용 */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                  {removeMarkdown(post.content)}
                </p>

                {/* 메타 정보 */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <FaEye className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-red-500">
                      <FaHeart className="w-3.5 h-3.5 mr-1" />
                      <span>{post.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            검색 결과가 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}

// 이미지 URL 유효성 검사 함수 추가
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && 
           parsedUrl.hostname !== 'example.com' && 
           !parsedUrl.hostname.endsWith('.example.com');
  } catch {
    return false;
  }
}
