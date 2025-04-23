'use client';

import { Metadata } from 'next';
import PostDetail from '@/components/PostDetail';
import Comments from '@/components/Comments';
import { FaSpinner } from 'react-icons/fa';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PostPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = params;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`);
  const post = await response.json();

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}

export default function PostPage({ params }: PostPageProps) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${params.id}`);
        
        if (!response.ok) {
          notFound();
        }

        const data = await response.json();
        setPost(data);
        setLoading(false);

        // 조회수 증가
        await fetch(`/api/posts/${params.id}/view`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('게시글 로딩 오류:', error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  if (!post) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />
      
      <div className="mt-12">
        <Comments postId={params.id} />
      </div>
    </div>
  );
}