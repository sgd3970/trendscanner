import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { method } = req;
  const { slug } = req.query;

  switch (method) {
    case 'GET':
      // 게시글 상세 조회 로직
      break;
    case 'PATCH':
      // 게시글 수정 로직 (관리자용)
      break;
    case 'DELETE':
      // 게시글 삭제 로직 (관리자용)
      break;
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 