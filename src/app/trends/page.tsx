'use client';

import { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  views: number;
  likes: number;
  imageUrl?: string;
  gptImageUrl?: string;
  featuredImage?: { url: string };
  category: string;
  keywords: string[];
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
            <PostCard
              key={post._id}
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