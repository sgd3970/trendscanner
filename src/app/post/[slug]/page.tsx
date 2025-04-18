'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Comments from '@/components/Comments';

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  likes: number;
}

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const slug = window.location.pathname.split('/').pop();
        const response = await fetch(`/api/posts/${slug}`);
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
  }, []);

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
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
        
        <div className="relative aspect-[16/9] w-full mb-8">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-gray-500">
            {format(new Date(post.createdAt), 'PPP', { locale: ko })}
          </div>
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
          >
            {isLiked ? (
              <HeartIconSolid className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6" />
            )}
            <span>{post.likes}</span>
          </button>
        </div>

        <div className="mt-12">
          <Comments postId={post._id} />
        </div>
      </article>
    </div>
  );
} 