import { Suspense } from 'react';
import PostDetail from '@/components/PostDetail';
import Comments from '@/components/Comments';
import { FaSpinner } from 'react-icons/fa';

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">포스트 ID가 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[200px]">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      }>
        <PostDetail id={id} />
      </Suspense>
      
      <div className="mt-12">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[200px]">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        }>
          <Comments postId={id} />
        </Suspense>
      </div>
    </div>
  );
} 