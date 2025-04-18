import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const keywords = await KeywordCache.find()
      .sort({ createdAt: -1 });

    return NextResponse.json({
      keywords: keywords.map(keyword => ({
        _id: keyword._id,
        keyword: keyword.keyword,
        used: keyword.used,
        createdAt: keyword.createdAt
      }))
    });
  } catch (error) {
    console.error('키워드 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '키워드 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 