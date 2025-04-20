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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [success, setSuccess] = useState('');
  const [keywordCount, setKeywordCount] = useState(1);

  const handleAutoPosting = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setDebugInfo(null);

    try {
      console.log('자동 포스팅 요청 시작:', { keywordCount });
      
      const response = await fetch('/api/posts/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywordCount }),
      });

      const data = await response.json();
      console.log('API 응답:', data);

      if (!response.ok) {
        // 에러 응답 처리
        const errorMessage = data.error || '자동 포스팅에 실패했습니다.';
        console.error('API 에러:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: data
        });
        setError(errorMessage);
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: data
        });
        return;
      }

      setSuccess(`${data.count}개의 포스트가 성공적으로 생성되었습니다.`);
      setDebugInfo({
        success: true,
        createdPosts: data.posts
      });
      router.refresh();
    } catch (err) {
      console.error('자동 포스팅 에러:', err);
      setError('자동 포스팅 중 오류가 발생했습니다.');
      setDebugInfo({
        error: err instanceof Error ? err.message : '알 수 없는 오류',
        fullError: err
      });
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
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-700 font-semibold mb-2">오류 발생</h3>
            <p className="text-red-600 mb-2">{error}</p>
            {debugInfo && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-red-700 mb-2">디버그 정보:</h4>
                <pre className="bg-red-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-700 font-semibold mb-2">성공</h3>
            <p className="text-green-600">{success}</p>
            {debugInfo && debugInfo.success && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-green-700 mb-2">생성된 포스트:</h4>
                <pre className="bg-green-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo.createdPosts, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 