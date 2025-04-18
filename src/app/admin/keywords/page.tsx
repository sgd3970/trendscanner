'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Keyword {
  _id: string;
  keyword: string;
  used: boolean;
  createdAt: string;
}

export default function KeywordsPage() {
  const router = useRouter();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const response = await fetch('/api/keywords');
      const data = await response.json();
      if (response.ok) {
        setKeywords(data.keywords);
      }
    } catch (error) {
      console.error('키워드 목록 로딩 실패:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('모든 키워드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await fetch('/api/keywords/delete-all', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`키워드 ${data.deletedCount}개가 삭제되었습니다.`);
        fetchKeywords();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('키워드 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectKeywords = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await fetch('/api/keywords/collect', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`키워드 ${data.count}개가 수집되었습니다.`);
        fetchKeywords();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('키워드 수집 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">키워드 관리</h1>
        <div className="flex gap-4">
          <button
            onClick={handleCollectKeywords}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            키워드 수집
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            전체 삭제
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">키워드</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {keywords.map((keyword) => (
                <tr key={keyword._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{keyword.keyword}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      keyword.used 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {keyword.used ? '사용됨' : '미사용'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(keyword.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 