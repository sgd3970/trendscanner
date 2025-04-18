import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      posts.map(post => ({
        _id: post._id?.toString() || '',
        title: post.title || '',
        content: post.content || '',
        createdAt: post.createdAt || new Date(),
        keywords: Array.isArray(post.keywords) ? post.keywords : [],
        views: typeof post.views === 'number' ? post.views : 0,
        likes: typeof post.likes === 'number' ? post.likes : 0,
        imageUrl: post.imageUrl || undefined,
        gptImageUrl: post.gptImageUrl || undefined,
        featuredImage: post.featuredImage || undefined,
      }))
    );
  } catch (error) {
    console.error('포스트 조회 에러:', error);
    return NextResponse.json(
      { error: '포스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 