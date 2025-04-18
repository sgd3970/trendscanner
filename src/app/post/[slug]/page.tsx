import { useRouter } from 'next/router';

export default function PostDetail() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">게시글 상세 페이지</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">게시글 내용이 여기에 표시됩니다.</p>
      </div>
    </div>
  );
} 