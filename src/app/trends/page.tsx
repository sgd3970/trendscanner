'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegClock, FaRegEye } from 'react-icons/fa';

interface Post {
  _id: string;
  title: string;
  content: string;
  thumbnail: string;
  category: string;
  views: number;
  createdAt: string;
  imageUrl?: string;
  gptImageUrl?: string;
  featuredImage?: { url: string };
  images?: string[];
}

export default function TrendsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?category=trend');
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error('포스트 불러오기 실패:', error);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setVisiblePosts((prev) => prev + 6);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">트렌드 뉴스</h1>
        
        {/* 포스트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.slice(0, visiblePosts).map((post) => (
            <Link
              key={post._id}
              href={`/trendposts/${post._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative h-48">
                <Image
                  src={post.images?.[0] || post.imageUrl || post.gptImageUrl || post.featuredImage?.url || '/placeholder.jpg'}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <FaRegClock className="mr-1" />
                  <span className="mr-4">{formatDate(post.createdAt)}</span>
                  <FaRegEye className="mr-1" />
                  <span>{post.views}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 더보기 버튼 */}
        {visiblePosts < posts.length && (
          <div className="flex justify-center mb-12">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              더보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 