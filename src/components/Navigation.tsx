'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: '홈', path: '/' },
    { name: '트렌드 뉴스', path: '/trends' },
    { name: '쿠팡 리뷰', path: '/reviews' },
    { name: '추천', path: '/recommendations' },
    { name: '소개', path: '/about' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`py-4 px-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 