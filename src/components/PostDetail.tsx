'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaEye, FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa';
import Image from 'next/image';
import Header from '@/components/Header';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

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
  slug: string;
}

interface PostDetailProps {
  post: {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    keywords: string[];
    views: number;
    likes: number;
    imageUrl?: string;
    slug: string;
  };
}

const CustomImage: Components['img'] = (props) => {
  if (!props.src || typeof props.src !== 'string') return null;
  
  // 이미지 URL이 유효한지 확인
  try {
    new URL(props.src);
  } catch (_) {
    console.error('Invalid image URL:', props.src);
    return null;
  }

  return (
    <div className="my-8">
      <div 
        className="relative w-full h-[400px]" 
        style={{ position: 'relative', width: '100%', height: '400px' }}
      >
        <Image
          src={props.src}
          alt={props.alt || ''}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true}
        />
      </div>
      {props.alt && (
        <div className="text-center text-sm text-gray-500 mt-2">
          {props.alt}
        </div>
      )}
    </div>
  );
};

const CustomParagraph: Components['p'] = ({ children }) => {
  // 자식이 하나이고 이미지인 경우
  if (
    React.Children.count(children) === 1 &&
    React.isValidElement(children) &&
    children.type === CustomImage
  ) {
    return children;
  }
  return <p className="mb-4 text-gray-700">{children}</p>;
};

export default function PostDetail({ post }: PostDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    setIsLiked(likedPosts.includes(post._id));
  }, [post._id]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isLiked ? 'unlike' : 'like',
        }),
      });

      if (!response.ok) {
        throw new Error('좋아요 처리에 실패했습니다.');
      }

      const data = await response.json();
      setLikes(data.likes);
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

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
          >
            <FaArrowLeft className="mr-2" />
            목록으로 돌아가기
          </Link>

          <article className="bg-white rounded-xl shadow-sm overflow-hidden">
            {post.imageUrl && (
              <div className="relative w-full h-[400px]">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>{post.views || 0} views</span>
                <span className="mx-2">•</span>
                <button
                  onClick={handleLike}
                  className={`flex items-center ${
                    isLiked ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  <FaHeart className="w-5 h-5 mr-1" />
                  {likes}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {post.keywords?.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="prose max-w-none">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
} 