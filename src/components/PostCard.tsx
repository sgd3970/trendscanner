"use client";

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaEye, FaHeart } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  keywords: string[];
  views: number;
  likes: number;
  category: string;
  thumbnailUrl?: string;
}

// 마크다운 문법 제거 함수
function removeMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거
    .replace(/\[.*?\]\(.*?\)/g, '') // 링크 제거
    .replace(/#{1,6}\s?/g, '') // 제목 문법 제거
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // 볼드 처리 제거
    .replace(/(\*|_)(.*?)\1/g, '$2') // 이탤릭 처리 제거
    .replace(/~~.*?~~/g, '') // 취소선 제거
    .replace(/`{1,3}.*?`{1,3}/g, '') // 코드 블록 제거
    .replace(/\n/g, ' ') // 줄바꿈을 공백으로 변경
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로 변경
    .trim();
}

// 이미지 최적화 설정
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function PostCard({
  id,
  title,
  description,
  createdAt,
  keywords,
  views,
  likes,
  category,
  thumbnailUrl
}: PostCardProps) {
  const formattedDate = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ko,
  });

  // 마크다운 텍스트를 일반 텍스트로 변환
  const plainDescription = removeMarkdown(description);

  return (
    <Link
      href={`/posts/${id}`}
      className="group block bg-white rounded-xl border border-gray-100 hover:border-indigo-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-[260px] flex flex-col"
    >
      {/* 썸네일 이미지 */}
      <div className="relative w-full h-[140px] overflow-hidden">
        {thumbnailUrl && (
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              loader={imageLoader}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODhAQEA4QEBAPj4+Pj4+Pj4+Pj4+Pj7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        {/* 카테고리 오버레이 */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
              category === 'trend'
                ? 'bg-indigo-500/80'
                : 'bg-green-500/80'
            }`}
          >
            {category === 'trend' ? '트렌드' : '쿠팡'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* 키워드 태그 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.slice(0, 2).map((keyword) => (
            <span
              key={keyword}
              className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full font-medium"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* 제목 */}
        <h2 className="text-lg font-semibold mb-3 text-gray-800 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
          {title}
        </h2>

        {/* 메타 정보 */}
        <div className="flex justify-between items-center text-sm mt-auto">
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