"use client";

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaEye, FaHeart } from 'react-icons/fa';
import { formatDate } from '@/lib/utils';

interface PostCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  keywords: string[];
  views: number;
  likes: number;
}

export default function PostCard({ id, title, description, createdAt, keywords, views, likes }: PostCardProps) {
  const formattedDate = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Link
      href={`/posts/${id}`}
      className="group block bg-white rounded-xl border border-gray-100 hover:border-blue-100 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="p-6">
        {/* 키워드 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
          {title}
        </h2>

        {/* 내용 미리보기 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="text-gray-400">{formattedDate}</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <FaEye className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500">{views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <FaHeart className="w-3.5 h-3.5 text-red-400" />
              <span className="text-gray-500">{likes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 