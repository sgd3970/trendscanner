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

interface ErrorResponse {
  error: string;
  details?: any;
}

export default function AutoPostingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
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

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || '자동 포스팅에 실패했습니다.';
        setError(errorMessage);
        return;
      }

      setSuccess(`${data.count}개의 포스트가 성공적으로 생성되었습니다.`);
      router.refresh();
    } catch (err) {
      setError('자동 포스팅 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">자동 포스팅</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              생성할 포스트 수 (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={keywordCount}
              onChange={(e) => setKeywordCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleAutoPosting}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? '생성 중...' : '포스트 생성하기'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-700 font-semibold mb-2">오류 발생</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-700 font-semibold mb-2">성공</h3>
              <p className="text-green-600">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 