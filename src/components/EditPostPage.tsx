'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostForm from '@/components/PostForm';

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
}

export default function EditPostPage({ id }: { id: string }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) throw new Error('게시글을 불러오는데 실패했습니다.');
        const data = await response.json();
        setPost(data);
      } catch (_) {
        console.error('게시글 불러오기 오류');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (postData: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '포스트 수정에 실패했습니다.');
      }
      router.push('/admin/posts');
    } catch (error) {
      alert(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center">로딩 중...</div>;
  }

  if (!post) {
    return <div className="text-center text-gray-600">포스트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">포스트 수정</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <PostForm initialData={post} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
