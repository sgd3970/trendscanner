'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import Link from 'next/link';
import {
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  KeyIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      const isAdmin = localStorage.getItem('isAdmin');
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row">
      {/* 사이드바 */}
      <aside className="bg-white shadow-sm w-full sm:w-64 sm:min-h-screen">
        <nav className="p-4">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-800">관리자 페이지</h1>
          </div>
          
          <div className="space-y-2">
            <Link
              href="/admin/dashboard"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/dashboard'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <HomeIcon className="w-5 h-5 mr-3" />
              <span>대시보드</span>
            </Link>

            <Link
              href="/admin/posts"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/posts'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 mr-3" />
              <span>게시글 관리</span>
            </Link>

            <Link
              href="/admin/comments"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/comments'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChatBubbleLeftIcon className="w-5 h-5 mr-3" />
              <span>댓글 관리</span>
            </Link>

            <Link
              href="/admin/keywords"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/keywords'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <KeyIcon className="w-5 h-5 mr-3" />
              <span>키워드 관리</span>
            </Link>

            <Link
              href="/admin/auto-posting"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/auto-posting'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <PencilSquareIcon className="w-5 h-5 mr-3" />
              <span>자동 포스팅</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
} 