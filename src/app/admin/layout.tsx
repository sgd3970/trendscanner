'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import Link from 'next/link';
import { HomeIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="ml-64 p-8">
        <nav className="space-y-1">
          <Link
            href="/admin"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/admin'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <HomeIcon className="w-5 h-5 mr-3" />
            대시보드
          </Link>
          <Link
            href="/admin/posts"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/admin/posts'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <DocumentTextIcon className="w-5 h-5 mr-3" />
            게시글 관리
          </Link>
          <Link
            href="/admin/comments"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              pathname === '/admin/comments'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3" />
            댓글 관리
          </Link>
        </nav>
        {children}
      </main>
    </div>
  );
} 