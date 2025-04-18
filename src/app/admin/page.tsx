'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaNewspaper, FaComments, FaChartLine, FaMagic } from 'react-icons/fa';
import Link from 'next/link';

interface DashboardStats {
  totalPosts: number;
  totalComments: number;
  recentPosts: Array<{
    id: string;
    title: string;
    createdAt: string;
    views: number;
  }>;
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
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
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
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('키워드 수집 중 오류가 발생했습니다.');
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
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`포스트가 생성되었습니다: ${data.post.title}`);
        router.refresh();
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
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
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

        <Link href="/admin/auto-posting" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <FaMagic className="text-yellow-500 text-2xl" />
            <span className="text-2xl font-bold">자동 포스팅</span>
          </div>
          <h3 className="text-gray-600">GPT 포스팅</h3>
        </Link>
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
              <div key={comment.id} className="p-3 hover:bg-gray-50 rounded-lg">
                <Link 
                  href={`/admin/posts/${comment.postId}`}
                  className="text-sm text-blue-600 hover:underline mb-1 block"
                >
                  {comment.postTitle}
                </Link>
                <p className="text-gray-800 text-sm mb-1">{comment.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{comment.author}</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 