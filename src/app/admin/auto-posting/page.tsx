'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

interface Post {
  _id: string;
  title: string;
  content: string;
  keywords: string[];
  imageUrl?: string;
}

interface AutoPostingResponse {
  success: boolean;
  message: string;
  posts: Post[];
}

export default function AutoPostingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAutoPosting = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/auto-posting', {
        method: 'POST',
      });

      const data: AutoPostingResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '자동 포스팅에 실패했습니다.');
      }

      // 각 포스트의 필수 필드 확인
      const validPosts = data.posts.filter((post: Post) => 
        post._id &&
        post.title &&
        post.content &&
        post.keywords &&
        Array.isArray(post.keywords)
      );

      if (validPosts.length === 0) {
        throw new Error('생성된 포스트가 없습니다.');
      }

      setSuccess(`${validPosts.length}개의 포스트가 성공적으로 생성되었습니다.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '자동 포스팅 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">자동 포스팅</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">
          자동 포스팅 기능을 사용하면 GPT를 활용하여 새로운 포스트를 자동으로 생성할 수 있습니다.
        </p>
        
        <button
          onClick={handleAutoPosting}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              포스팅 생성 중...
            </span>
          ) : (
            '자동 포스팅 시작'
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
      </div>
    </div>
  );
} 