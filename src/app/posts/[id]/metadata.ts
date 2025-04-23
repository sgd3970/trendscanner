import { Metadata } from 'next';

interface PostPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = params;
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