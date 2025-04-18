import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE() {
  try {
    await connectDB();

    const result = await KeywordCache.deleteMany({});
    
    return NextResponse.json({
      message: '모든 키워드가 삭제되었습니다.',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('키워드 일괄 삭제 에러:', error);
    return NextResponse.json(
      { error: '키워드 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 