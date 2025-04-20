'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Comments from '@/components/Comments';

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  likes: number;
  slug: string;
}

export default function PostDetail({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/by-slug/${params.slug}`);
        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setPost(data);
        
        // 로컬 스토리지에서 좋아요 상태 확인
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        setIsLiked(likedPosts.includes(data._id));
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
        console.error('게시글 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  const handleLike = async () => {
    if (!post) return;

    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' }),
      });

      if (!response.ok) {
        throw new Error('좋아요 처리에 실패했습니다.');
      }

      const data = await response.json();
      setPost({ ...post, likes: data.likes });
      setIsLiked(!isLiked);

      // 로컬 스토리지 업데이트
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
    } catch (err) {
      console.error('좋아요 처리 오류:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || '게시글을 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          <span className="text-sm sm:text-base">목록으로 돌아가기</span>
        </Link>

        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            {/* 제목 */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            {/* 날짜와 좋아요 */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <time dateTime={post.createdAt}>
                {format(new Date(post.createdAt), 'PPP', { locale: ko })}
              </time>
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
              >
                {isLiked ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span>{post.likes}</span>
              </button>
            </div>

            {/* 이미지 */}
            {!imageError && post.imageUrl && (
              <div className="relative aspect-[16/9] w-full mb-6 rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            {/* 본문 */}
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-6 md:p-8">
            <Comments postId={post._id} />
          </div>
        </article>
      </div>
    </div>
  );
} 