import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function POST() {
  try {
    await connectDB();
    
    const result = await Post.updateMany(
      { category: { $exists: false } },
      { $set: { category: 'trend' } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount}개의 포스트가 'trend' 카테고리로 업데이트되었습니다.`
    });
  } catch (error) {
    console.error('카테고리 업데이트 오류:', error);
    return NextResponse.json(
      { error: '카테고리 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 