import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }

    const query = category ? { category } : {};
    const posts = await db.collection('posts')
      .find(query)
      .project({
        _id: 1,
        title: 1,
        content: 1,
        createdAt: 1,
        views: 1,
        likes: 1,
        imageUrl: 1,
        gptImageUrl: 1,
        featuredImage: 1,
        category: 1,
        keywords: 1
      })
      .sort({ createdAt: -1 })
      .toArray();

    const mappedPosts = posts.map(post => ({
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
      category: post.category || 'trend',
      images: Array.isArray(post.images) ? post.images : []
    }));

    const response = NextResponse.json(mappedPosts);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: '포스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 