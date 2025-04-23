'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaEye, FaHeart } from 'react-icons/fa';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';
import PostCard from '@/components/PostCard';

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
  category: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleTrendPosts, setVisibleTrendPosts] = useState(4);
  const [visibleCoupangPosts, setVisibleCoupangPosts] = useState(2);

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

  const trendPosts = filteredPosts.filter(post => post.category === 'trend');
  const coupangPosts = filteredPosts.filter(post => post.category === 'coupang');

  const handleLoadMore = () => {
    setVisibleTrendPosts(prev => prev + 4);
    setVisibleCoupangPosts(prev => prev + 2);
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="제목, 내용, 키워드로 검색"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Trend 포스트 (1, 2열) */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trendPosts.slice(0, visibleTrendPosts).map(post => (
              <PostCard
                key={post._id}
                id={post._id}
                title={post.title}
                description={post.content.substring(0, 150)}
                createdAt={post.createdAt}
                keywords={post.keywords}
                views={post.views}
                likes={post.likes}
                category={post.category}
              />
            ))}
          </div>

          {/* Coupang 포스트 (3열) */}
          <div className="grid grid-cols-1 gap-4">
            {coupangPosts.slice(0, visibleCoupangPosts).map(post => (
              <PostCard
                key={post._id}
                id={post._id}
                title={post.title}
                description={post.content.substring(0, 150)}
                createdAt={post.createdAt}
                keywords={post.keywords}
                views={post.views}
                likes={post.likes}
                category={post.category}
              />
            ))}
          </div>
        </div>

        {(trendPosts.length > visibleTrendPosts || coupangPosts.length > visibleCoupangPosts) && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              더보기
            </button>
          </div>
        )}

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
