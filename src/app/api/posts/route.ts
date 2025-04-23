import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }

    const posts = await db.collection('posts').find().sort({ createdAt: -1 }).toArray();

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
        category: post.source || 'trend'  // source 필드를 category로 사용
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