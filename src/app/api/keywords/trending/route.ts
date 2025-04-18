import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export async function GET() {
  try {
    await connectDB();

    // 최근 24시간 내에 생성된 키워드 중 상위 10개를 조회
    const trendingKeywords = await KeywordCache.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('keyword');

    return NextResponse.json({
      keywords: trendingKeywords.map(k => k.keyword)
    });
  } catch (error) {
    console.error('트렌딩 키워드 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '트렌딩 키워드를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 