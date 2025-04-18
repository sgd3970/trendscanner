'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaNewspaper, 
  FaComments, 
  FaChartLine, 
  FaMagic,
  FaSignOutAlt
} from 'react-icons/fa';

export default function AdminNavbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-8">관리자 패널</h2>
        
        <ul className="space-y-2">
          <li>
            <Link
              href="/admin"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/admin') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaHome className="mr-3" />
              대시보드
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/posts"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/admin/posts') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaNewspaper className="mr-3" />
              포스트 관리
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/comments"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/admin/comments') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaComments className="mr-3" />
              댓글 관리
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/keywords"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/admin/keywords') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaChartLine className="mr-3" />
              키워드 관리
            </Link>
          </li>
          
          <li>
            <Link
              href="/admin/auto-posting"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive('/admin/auto-posting') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaMagic className="mr-3" />
              자동 포스팅
            </Link>
          </li>
        </ul>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="mr-3" />
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
} 