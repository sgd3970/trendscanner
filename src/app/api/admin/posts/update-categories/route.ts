import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    await connectDB();

    const result = await Post.updateMany(
      { category: { $ne: 'trend' } },
      { $set: { category: 'trend' } }
    );

    return NextResponse.json({
      message: `${result.modifiedCount}개의 게시글 카테고리가 'trend'로 변경되었습니다.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('카테고리 업데이트 오류:', error);
    return NextResponse.json(
      { error: '카테고리 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
} 