import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const keywords = await KeywordCache.find()
      .sort({ createdAt: -1 })
      .lean();

    // 응답 데이터 구조화
    const formattedKeywords = keywords.map(keyword => ({
      _id: keyword._id.toString(),
      keyword: keyword.keyword,
      count: 0, // 사용 횟수는 현재 구현되지 않음
      createdAt: keyword.createdAt.toISOString(),
      used: keyword.used
    }));

    return NextResponse.json({
      keywords: formattedKeywords
    });
  } catch (error) {
    console.error('키워드 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '키워드 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 