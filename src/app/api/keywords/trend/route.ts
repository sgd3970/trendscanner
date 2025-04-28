import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Keyword from '@/models/Keyword';

export async function GET() {
  try {
    await connectDB();

    // 모든 키워드 가져오기
    const keywords = await Keyword.find().select('keyword');
    
    // 랜덤으로 5개 선택
    const randomKeywords = keywords
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(k => k.keyword);

    return NextResponse.json({ keywords: randomKeywords });
  } catch (error) {
    console.error('트렌드 키워드 조회 오류:', error);
    return NextResponse.json(
      { error: '트렌드 키워드를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 