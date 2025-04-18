// ✅ page.tsx
import EditPostPage from '@/components/EditPostPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <EditPostPage id={params.id} />;
}
