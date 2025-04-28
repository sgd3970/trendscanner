import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    console.log('Processing GET request to /api/posts');
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    console.log('Requested category:', category);

    await connectDB();
    console.log('Database connected');
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }

    // 카테고리 필터 적용
    const query = category ? { category } : {};
    console.log('MongoDB query:', query);

    const posts = await db.collection('posts').find(query).sort({ createdAt: -1 }).toArray();
    console.log('Found posts count:', posts.length);
    console.log('First post sample:', posts[0] ? {
      _id: posts[0]._id,
      title: posts[0].title,
      category: posts[0].category
    } : 'No posts found');

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

    console.log('Mapped posts count:', mappedPosts.length);
    console.log('First mapped post sample:', mappedPosts[0] || 'No posts mapped');

    return NextResponse.json(mappedPosts);
  } catch (error) {
    console.error('포스트 조회 에러:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: '포스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 