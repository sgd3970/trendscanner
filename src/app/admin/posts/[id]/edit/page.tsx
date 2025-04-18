import EditPostPage from '@/components/EditPostPage';

export default function Page({ params }: any) {
  return <EditPostPage id={params.id} />;
}
