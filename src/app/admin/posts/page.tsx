'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Post {
  _id: string;
  title: string;
  createdAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setPosts(data);
    } catch {
      console.error('게시글 불러오기 오류');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('게시글 삭제에 실패했습니다.');
      }

      setPosts(posts.filter(post => post._id !== id));
    } catch {
      console.error('게시글 삭제 오류');
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
        <h1 className="text-2xl font-bold text-gray-900">게시글 관리</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          새 게시글 작성
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(new Date(post.createdAt), 'PPP', { locale: ko })}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/posts/${post._id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
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