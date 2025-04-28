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
  thumbnailUrl?: string;
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

export default function HomePage() {
  const [trendPosts, setTrendPosts] = useState<Post[]>([]);
  const [coupangPosts, setCoupangPosts] = useState<Post[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 트렌드 뉴스 가져오기
        const trendResponse = await fetch('/api/posts?category=trend');
        const trendData = await trendResponse.json();
        setTrendPosts(trendData.slice(0, 6));

        // 쿠팡 리뷰 가져오기
        const coupangResponse = await fetch('/api/posts?category=coupang');
        const coupangData = await coupangResponse.json();
        setCoupangPosts(coupangData.slice(0, 6));

        // 최신 트렌드 키워드 가져오기
        const keywordsResponse = await fetch('/api/keywords/trending');
        const keywordsData = await keywordsResponse.json();
        setKeywords(keywordsData.keywords || []);
      } catch (error) {
        console.error('포스트 불러오기 실패:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
        {/* 섹션 1: 소개 */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">트렌드스캐너에 오신 것을 환영합니다</h1>
          <p className="text-lg text-gray-600">
            최신 트렌드와 리뷰를 한눈에 확인하세요. 트렌드스캐너가 엄선한 콘텐츠를 제공합니다.
          </p>
        </section>

        {/* 섹션 2: 트렌드 뉴스 */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">트렌드 뉴스</h2>
            <Link 
              href="/trends"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              트렌드 뉴스 전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 h-[500px]">
            {trendPosts.map((post) => (
              <div key={post._id} className="w-full">
                <PostCard
                  id={post._id}
                  title={post.title}
                  description={post.content.substring(0, 150)}
                  createdAt={post.createdAt}
                  views={post.views}
                  likes={post.likes}
                  category={post.category}
                  thumbnailUrl={post.imageUrl || post.gptImageUrl || post.featuredImage?.url}
                  keywords={post.keywords}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 섹션 3: 쿠팡 리뷰 */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">쿠팡 리뷰</h2>
            <Link 
              href="/reviews"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              쿠팡 리뷰 전체보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 h-[500px]">
            {coupangPosts.map((post) => (
              <div key={post._id} className="w-full">
                <PostCard
                  id={post._id}
                  title={post.title}
                  description={post.content.substring(0, 150)}
                  createdAt={post.createdAt}
                  views={post.views}
                  likes={post.likes}
                  category={post.category}
                  thumbnailUrl={post.imageUrl || post.gptImageUrl || post.featuredImage?.url}
                  keywords={post.keywords}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 섹션 4: 오늘의 키워드 */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">오늘의 트렌드 키워드</h2>
          <div className="flex flex-wrap gap-3">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </section>
      </div>
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
