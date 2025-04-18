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
}

interface PostDetailProps {
  id: string;
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

export default function PostDetail({ id }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error('포스트를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        console.log('포스트 데이터:', data);  // 전체 포스트 데이터 로깅
        console.log('이미지 URL:', data.imageUrl);  // 이미지 URL 로깅
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    // 로컬 스토리지에서 좋아요 상태 확인
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    setIsLiked(!!likedPosts[id]);
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isLiked ? 'unlike' : 'like'
        })
      });

      if (!response.ok) {
        throw new Error('좋아요 처리에 실패했습니다.');
      }

      const { likes } = await response.json();
      
      // 로컬 스토리지 업데이트
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      if (isLiked) {
        delete likedPosts[id];
      } else {
        likedPosts[id] = true;
      }
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

      setIsLiked(!isLiked);
      if (post) {
        setPost({
          ...post,
          likes: likes
        });
      }
    } catch (err) {
      console.error('좋아요 오류:', err);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">포스트를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!post) {
    return <div className="text-center text-gray-600">포스트를 찾을 수 없습니다.</div>;
  }

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

          <article className="bg-white rounded-lg shadow-sm">
            <div className="p-8 border-b border-gray-100">
              <div className="flex flex-wrap gap-2 mb-6">
                {post.keywords?.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              <div className="flex items-center justify-between text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">관리자</span>
                  <span>·</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <FaEye className="mr-1" />
                    <span>{(post.views || 0).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleLike}
                    className="flex items-center text-red-500 hover:text-red-600 transition-colors"
                  >
                    {isLiked ? <FaHeart className="mr-1" /> : <FaRegHeart className="mr-1" />}
                    <span>{(post.likes || 0).toLocaleString()}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* 이미지 섹션 - 실제 이미지 URL이 있는 경우에만 표시 */}
              {post.imageUrl && post.imageUrl !== '/images/default-post-image.jpg' && (
                <div 
                  className="relative mb-8" 
                  id="post-image-container"
                  style={{ width: '100%', height: '400px', position: 'relative' }}
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={true}
                    onError={(e) => {
                      console.error('이미지 로드 실패:', post.imageUrl);
                      const imgElement = e.currentTarget as HTMLImageElement;
                      imgElement.style.display = 'none';
                      const container = document.getElementById('post-image-container');
                      if (container) {
                        container.style.display = 'none';
                      }
                    }}
                  />
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: CustomImage,
                    p: CustomParagraph,
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
} 