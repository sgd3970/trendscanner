import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { generateKeywords } from '@/lib/gpt';
import { searchImages } from '@/lib/unsplash';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'POST':
      // GPT에게 키워드 요청 및 게시글 자동 생성 로직
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 