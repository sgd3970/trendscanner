'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Keyword {
  _id: string;
  keyword: string;
  used: boolean;
  createdAt: string;
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      setError(error instanceof Error ? error.message : '키워드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async () => {
    setIsCollecting(true);
    try {
      setError(null);
      
      const response = await fetch('/api/keywords/collect', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '키워드 수집에 실패했습니다.');
      }

      await fetchKeywords();
    } catch (error) {
      setError(error instanceof Error ? error.message : '키워드 수집 중 오류가 발생했습니다.');
    } finally {
      setIsCollecting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 키워드를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/keywords/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '키워드 삭제에 실패했습니다.');
      }

      setKeywords(keywords.filter(keyword => keyword._id !== id));
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : '키워드 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('모든 키워드를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    try {
      setError(null);

      const response = await fetch('/api/keywords/delete-all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '키워드 일괄 삭제에 실패했습니다.');
      }

      setKeywords([]);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : '키워드 일괄 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">키워드 관리</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleCollect}
            disabled={isCollecting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${isCollecting ? 'animate-spin' : ''}`} />
            {isCollecting ? '수집 중...' : '키워드 수집'}
          </button>
          {keywords.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              {isDeleting ? '삭제 중...' : '전체 삭제'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  키워드
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keywords.map((keyword) => (
                <tr key={keyword._id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {keyword.keyword}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        keyword.used
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {keyword.used ? '사용됨' : '미사용'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(keyword.createdAt), 'PPP', { locale: ko })}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(keyword._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {keywords.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          수집된 키워드가 없습니다.
        </div>
      )}
    </div>
  );
} 