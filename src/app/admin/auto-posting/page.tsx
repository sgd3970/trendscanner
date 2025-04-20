'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
}

interface AutoPostingResponse {
  message: string;
  count: number;
  posts: Post[];
}

export default function AutoPostingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [keywordCount, setKeywordCount] = useState(1);

  const handleAutoPosting = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/posts/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywordCount }),
      });

      const data: AutoPostingResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '자동 포스팅에 실패했습니다.');
      }

      setSuccess(`${data.count}개의 포스트가 성공적으로 생성되었습니다.`);
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

        <div className="mb-4">
          <label htmlFor="keywordCount" className="block text-sm font-medium text-gray-700 mb-2">
            생성할 포스트 개수 (1-5)
          </label>
          <input
            type="number"
            id="keywordCount"
            min="1"
            max="5"
            value={keywordCount}
            onChange={(e) => setKeywordCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
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