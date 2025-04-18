import dynamic from 'next/dynamic';

const EditPostPage = dynamic(() => import('@/components/EditPostPage'), { ssr: false });

export default function Page({ params }: { params: { id: string } }) {
  return <EditPostPage id={params.id} />;
}
