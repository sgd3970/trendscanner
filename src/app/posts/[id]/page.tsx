'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { FaEye, FaHeart, FaRegHeart, FaArrowLeft } from 'react-icons/fa';
import Header from '@/components/Header';
import Comments from '@/components/Comments';
import { notFound, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

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

const ImageRenderer: Components['img'] = (props) => {
  const { src, alt } = props;
  if (!src) return null;
  
  // 이미지 URL 처리
  const imageUrl = src.startsWith('http') 
    ? src 
    : src.startsWith('/') 
      ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${src}`
      : `/${src}`;
  
  console.log('Rendering image with URL:', imageUrl); // 디버깅용 로그

  return (
    <div className="my-8">
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={imageUrl}
          alt={alt || ''}
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            console.error('Image load error:', imageUrl); // 디버깅용 로그
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-image.jpg';
          }}
        />
      </div>
      {alt && (
        <div className="text-center text-sm text-gray-500 mt-2">
          {alt}
        </div>
      )}
    </div>
  );
};

// 미디어 태그를 HTML로 변환하는 함수
const renderContent = (content: string, videoUrl: string | null, images: string[]) => {
  let result = content;
  
  console.log('Content before processing:', content); // 디버깅용 로그
  console.log('Available images:', images); // 디버깅용 로그

  // 영상 태그 변환
  if (videoUrl) {
    const embedUrl = videoUrl.replace('watch?v=', 'embed/');
    result = result.replace('[영상]', `
      <div class="aspect-video w-full mb-6">
        <iframe
          src="${embedUrl}"
          class="w-full h-full rounded-lg"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      </div>
    `);
  }

  // 이미지 태그 변환
  images.forEach((url, i) => {
    const imageUrl = url.startsWith('http') 
      ? url 
      : url.startsWith('/') 
        ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${url}`
        : `/${url}`;
    
    console.log(`Converting image ${i + 1}:`, imageUrl); // 디버깅용 로그
    result = result.replace(`[이미지${i + 1}]`, `![이미지 ${i + 1}](${imageUrl})`);
  });

  console.log('Content after processing:', result); // 디버깅용 로그
  return result;
};

export default function PostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        console.log('Fetched post data:', data); // 디버깅용 로그
        setPost(data);
        
        // 조회수 증가 API 호출
        await fetch(`/api/posts/${id}/views`, {
          method: 'POST',
        });
        
        // 좋아요 상태 확인
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        setIsLiked(likedPosts.includes(id));
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!post) {
    return <div>Post not found</div>;
  }

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
                className="flex items-center"
              >
                {isLiked ? (
                  <FaHeart className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <FaRegHeart className="w-4 h-4 text-gray-400 mr-1" />
                )}
                <span>{post.likes}</span>
              </button>
            </div>

            {/* 썸네일 이미지 */}
            {post.thumbnailUrl && (
              <div className="relative w-full aspect-[16/9] mb-8">
                <Image
                  src={post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : `${process.env.NEXT_PUBLIC_BASE_URL || ''}${post.thumbnailUrl}`}
                  alt={post.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-thumbnail.jpg';
                  }}
                />
              </div>
            )}

            {/* 본문 내용 */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ImageRenderer,
                  p: ({ children }) => <p className="mb-4 text-gray-700">{children}</p>,
                  h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-bold mt-5 mb-2">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4">{children}</blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 rounded p-4 overflow-x-auto my-4">{children}</pre>
                  ),
                }}
              >
                {renderContent(post.content, post.videoUrl || null, post.images || [])}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        <Comments postId={post._id} />
      </main>
    </div>
  );
}