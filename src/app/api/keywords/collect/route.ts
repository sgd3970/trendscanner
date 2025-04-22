import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { SERPAPI_KEY } = process.env;
    
    if (!SERPAPI_KEY) {
      return NextResponse.json(
        { error: 'SERPAPI 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('engine', 'google_trends_trending_now');
    url.searchParams.append('geo', 'KR');
    url.searchParams.append('hl', 'ko');
    url.searchParams.append('api_key', SERPAPI_KEY);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SerpAPI 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const isValidKeyword = (query: string) => {
      const hasKoreanOrEnglish = /[a-zA-Z\u3131-\uD79D\uAC00-\uD7A3]/.test(query);
      const containsCJK = /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF]/.test(query);
      return hasKoreanOrEnglish && !containsCJK;
    };
    
    const trendingKeywords = data.trending_searches
      .map((item: any) => item.query)
      .filter(isValidKeyword)
      .slice(0, 60);

    if (trendingKeywords.length === 0) {
      throw new Error('트렌딩 키워드를 찾을 수 없습니다.');
    }

    await connectDB();

    for (const keyword of trendingKeywords) {
      await KeywordCache.findOneAndUpdate(
        { keyword },
        { $setOnInsert: { keyword, used: false, createdAt: new Date() } },
        { upsert: true }
      );
    }

    return NextResponse.json({
      message: '키워드 수집이 완료되었습니다.',
      count: trendingKeywords.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '키워드 수집 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 