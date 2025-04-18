'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Keyword {
  _id: string;
  keyword: string;
  used: boolean;
  createdAt: string;
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/keywords');
      if (!response.ok) {
        throw new Error('키워드를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      
      if (!data || !Array.isArray(data.keywords)) {
        throw new Error('키워드 데이터 형식이 올바르지 않습니다.');
      }
      
      setKeywords(data.keywords);
      setError(null);
    } catch (error) {
      console.error('키워드 불러오기 오류:', error);
      setError(error instanceof Error ? error.message : '키워드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectKeywords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/keywords/collect', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '키워드 수집에 실패했습니다.');
      }

      const data = await response.json();
      console.log('키워드 수집 응답:', data);
      
      await fetchKeywords();
    } catch (error) {
      console.error('키워드 수집 오류:', error);
      setError(error instanceof Error ? error.message : '키워드 수집 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('키워드 삭제에 실패했습니다.');
      }

      setKeywords(keywords.filter(keyword => keyword._id !== id));
      setError(null);
    } catch (error) {
      console.error('키워드 삭제 오류:', error);
      setError('키워드 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('모든 키워드를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/keywords/delete-all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('키워드 일괄 삭제에 실패했습니다.');
      }

      setKeywords([]);
      setError(null);
    } catch (error) {
      console.error('키워드 일괄 삭제 오류:', error);
      setError('키워드 일괄 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">키워드 관리</h1>
        <div className="space-x-4">
          <button
            onClick={handleCollectKeywords}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '수집 중...' : '키워드 수집'}
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={loading || keywords.length === 0}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            전체 삭제
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                키워드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword) => (
              <tr key={keyword._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{keyword.keyword}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    keyword.used ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {keyword.used ? '사용됨' : '미사용'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(keyword.createdAt), 'PPP', { locale: ko })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(keyword._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 