import { Metadata } from 'next';
import PostDetail from '@/components/PostDetail';
import Comments from '@/components/Comments';
import { FaSpinner } from 'react-icons/fa';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`);
  const post = await response.json();

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    notFound();
  }

  const post = await response.json();

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />
      
      <div className="mt-12">
        <Comments postId={id} />
      </div>
    </div>
  );
} 