'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { FaEye, FaHeart, FaRegHeart, FaArrowLeft } from 'react-icons/fa';
import Header from '@/components/Header';
import Comments from '@/components/Comments';
import { notFound } from 'next/navigation';

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  category: string;
  views: number;
  likes: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  images?: string[];
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) {
          throw new Error('포스트를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setPost(data);
        
        // 조회수 증가
        await fetch(`/api/posts/${params.id}/view`, { method: 'POST' });
        
        // 좋아요 상태 확인
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        setIsLiked(likedPosts.includes(params.id));
      } catch (error) {
        console.error('포스트 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' }),
      });

      if (!response.ok) throw new Error('좋아요 처리에 실패했습니다.');

      setIsLiked(!isLiked);
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      
      if (isLiked) {
        localStorage.setItem(
          'likedPosts',
          JSON.stringify(likedPosts.filter((id: string) => id !== post._id))
        );
      } else {
        localStorage.setItem(
          'likedPosts',
          JSON.stringify([...likedPosts, post._id])
        );
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) return notFound();

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <FaArrowLeft className="mr-2" />
          목록으로 돌아가기
        </Link>

        <article className="bg-white rounded-xl shadow-sm overflow-hidden max-w-4xl mx-auto">
          <div className="p-8">
            {/* 제목 */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* 메타 정보 */}
            <div className="flex items-center text-sm text-gray-500 mb-8">
              <span>{formattedDate}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <FaEye className="w-4 h-4 mr-1" />
                <span>{post.views}</span>
              </div>
              <span className="mx-2">•</span>
              <button
                onClick={handleLike}
                className="flex items-center focus:outline-none"
              >
                {isLiked ? (
                  <FaHeart className="w-4 h-4 mr-1 text-red-500" />
                ) : (
                  <FaRegHeart className="w-4 h-4 mr-1" />
                )}
                <span>{post.likes}</span>
              </button>
            </div>

            {/* 트렌드 포스트 */}
            {post.category === 'trend' && (
              <div className="space-y-6">
                {post.thumbnailUrl && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                    <Image
                      src={post.thumbnailUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
                <div className="prose max-w-none">
                  {post.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 쿠팡 포스트 */}
            {post.category === 'coupang' && (
              <div className="space-y-6">
                {post.videoUrl && (
                  <div className="aspect-video w-full mb-6">
                    <iframe
                      src={post.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}
                {post.images && post.images.map((image, index) => (
                  <div key={index} className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                    <Image
                      src={image}
                      alt={`${post.title} - 이미지 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="prose max-w-none">
                  {post.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* 댓글 섹션 */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Comments postId={post._id} />
        </div>
      </main>
    </div>
  );
}