'use client';

import { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface DashboardData {
  totalPosts: number;
  totalViews: number;
  todayPosts: number;
  totalLikes: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-700 font-semibold mb-2">오류 발생</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">전체 게시글</h3>
            <p className="text-3xl font-bold text-blue-600">{data?.totalPosts || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">총 조회수</h3>
            <p className="text-3xl font-bold text-green-600">{data?.totalViews || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">오늘 작성된 글</h3>
            <p className="text-3xl font-bold text-purple-600">{data?.todayPosts || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">총 좋아요</h3>
            <p className="text-3xl font-bold text-red-600">{data?.totalLikes || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 