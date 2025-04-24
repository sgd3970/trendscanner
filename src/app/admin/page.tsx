'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaNewspaper, FaComments, FaChartLine, FaMagic } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalPosts: number;
  totalComments: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
  }>;
  recentComments: Array<{
    id: string;
    content: string;
    author: string;
    postId: string;
    postTitle: string;
    createdAt: string;
  }>;
  viewsByCategory: {
    trend: number;
    coupang: number;
  };
  viewsByDate: Array<{
    date: string;
    views: number;
  }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const viewsChartData = {
    labels: stats?.viewsByDate?.map(item => item.date) ?? [],
    datasets: [
      {
        label: '일일 조회수',
        data: stats?.viewsByDate?.map(item => item.views) ?? [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const categoryChartData = {
    labels: ['트렌드', '쿠팡'],
    datasets: [
      {
        label: '카테고리별 조회수',
        data: [
          stats?.viewsByCategory.trend || 0,
          stats?.viewsByCategory.coupang || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleUpdateCategories = async () => {
    if (!confirm('모든 기존 포스트의 카테고리를 "trend"로 변경하시겠습니까?')) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/admin/posts/update-categories', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('카테고리 업데이트에 실패했습니다.');
      }

      const data = await response.json();
      alert(data.message);
      window.location.reload();
    } catch (error) {
      console.error('카테고리 업데이트 오류:', error);
      alert('카테고리 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <button
          onClick={handleUpdateCategories}
          disabled={updating}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {updating ? '업데이트 중...' : '카테고리 업데이트'}
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/posts" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <FaNewspaper className="text-blue-500 text-2xl" />
            <span className="text-2xl font-bold">{stats?.totalPosts || 0}</span>
          </div>
          <h3 className="text-gray-600">전체 포스트</h3>
        </Link>

        <Link href="/admin/comments" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <FaComments className="text-green-500 text-2xl" />
            <span className="text-2xl font-bold">{stats?.totalComments || 0}</span>
          </div>
          <h3 className="text-gray-600">전체 댓글</h3>
        </Link>

        <Link href="/admin/keywords" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <FaChartLine className="text-purple-500 text-2xl" />
            <span className="text-2xl font-bold">키워드 관리</span>
          </div>
          <h3 className="text-gray-600">SERP 키워드</h3>
        </Link>

        <Link href="/admin/auto-post" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <FaMagic className="text-yellow-500 text-2xl" />
            <span className="text-2xl font-bold">자동 포스팅</span>
          </div>
          <h3 className="text-gray-600">GPT 포스팅</h3>
        </Link>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">일일 조회수 추이</h2>
          <div className="h-80">
            <Line
              data={viewsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">카테고리별 조회수</h2>
          <div className="h-80">
            <Bar
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 인기 게시글 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">인기 게시글</h2>
          <div className="space-y-4">
            {stats?.topPosts?.map((post) => (
              <Link 
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="text-gray-800 truncate flex-1">{post.title}</span>
                <span className="text-gray-500 ml-4">조회수 {post.views}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 댓글 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">최근 댓글</h2>
          <div className="space-y-4">
            {stats?.recentComments?.map((comment) => (
              <div key={comment.id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{comment.content}</p>
                <Link 
                  href={`/admin/posts/${comment.postId}`}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {comment.postTitle}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 