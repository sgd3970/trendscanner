'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PostForm from '@/components/PostForm';

interface PostFormProps {
  onSubmit: (postData: any) => Promise<void>;
  isSubmitting?: boolean;
}

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (postData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('포스트 생성에 실패했습니다.');
      }

      router.push('/admin/posts');
    } catch (error) {
      console.error('포스트 생성 오류:', error);
      alert('포스트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">새 포스트 작성</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
} 