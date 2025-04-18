'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  tags: string[];
}

export default function AutoPostingPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [keywordCount, setKeywordCount] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      const response = await fetch('/api/posts/auto-generated');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '포스트를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      
      if (!data || !data.posts) {
        throw new Error('포스트 데이터가 없습니다.');
      }

      if (!Array.isArray(data.posts)) {
        throw new Error('포스트 데이터 형식이 올바르지 않습니다.');
      }

      // 각 포스트의 필수 필드 확인
      const validPosts = data.posts.filter(post => 
        post._id && 
        post.title && 
        post.content && 
        Array.isArray(post.tags)
      );

      setPosts(validPosts);
    } catch (error) {
      console.error('자동 생성된 포스트 로딩 실패:', error);
      setMessage(error instanceof Error ? error.message : '포스트를 불러오는데 실패했습니다.');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePost = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await fetch('/api/posts/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywordCount }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`포스트가 생성되었습니다: ${data.post.title}`);
        fetchPosts();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('포스트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">자동 포스팅 관리</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">자동 생성된 포스트</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="keywordCount" className="text-sm text-gray-600">
                키워드 개수:
              </label>
              <select
                id="keywordCount"
                value={keywordCount}
                onChange={(e) => setKeywordCount(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}개
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGeneratePost}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              새 포스트 생성
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-gray-100 rounded">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="border rounded-lg p-4 hover:bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-sm bg-gray-100 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-2">
                생성일: {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => router.push(`/admin/posts/${post._id}/edit`)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  수정
                </button>
                <button
                  onClick={() => router.push(`/posts/${post._id}`)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 