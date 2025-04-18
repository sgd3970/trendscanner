import EditPostPage from '@/components/EditPostPage';

export default function Page({ params }: { params: { id: string } }) {
  return <EditPostPage id={params.id} />;
}
