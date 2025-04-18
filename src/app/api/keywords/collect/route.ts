import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { SERPAPI_KEY } = process.env;
    
    if (!SERPAPI_KEY) {
      console.error('SERPAPI_KEY 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'SERPAPI 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('SerpAPI 요청 시작...');

    // SerpAPI를 통해 트렌딩 키워드 가져오기
    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('engine', 'google_trends_trending_now');
    url.searchParams.append('geo', 'KR');
    url.searchParams.append('hl', 'ko');
    url.searchParams.append('api_key', SERPAPI_KEY);

    console.log('요청 URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI 에러 응답:', errorText);
      throw new Error(`SerpAPI 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 트렌딩 키워드 추출
    const isValidKeyword = (query: string) => {
      // 한글 또는 영문 포함 여부
      const hasKoreanOrEnglish = /[a-zA-Z\u3131-\uD79D\uAC00-\uD7A3]/.test(query);
    
      // 한자, 일본어(히라가나, 가타카나 포함) 포함 여부
      const containsCJK = /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF]/.test(query);
    
      // 한글 또는 영문은 포함되어야 하고, 한자/일본어는 없어야 함
      return hasKoreanOrEnglish && !containsCJK;
    };
    
    
    const trendingKeywords = data.trending_searches
    .map((item: any) => item.query)
    .filter(isValidKeyword)
    .slice(0, 30);

    

    console.log('추출된 키워드 수:', trendingKeywords.length);

    if (trendingKeywords.length === 0) {
      throw new Error('트렌딩 키워드를 찾을 수 없습니다.');
    }

    await connectDB();
    console.log('MongoDB 연결 성공');

    // 새로운 키워드만 저장
    for (const keyword of trendingKeywords) {
      await KeywordCache.findOneAndUpdate(
        { keyword },
        { $setOnInsert: { keyword, used: false, createdAt: new Date() } },
        { upsert: true }
      );
    }

    console.log('키워드 저장 완료');

    return NextResponse.json({
      message: '키워드 수집이 완료되었습니다.',
      count: trendingKeywords.length
    });
  } catch (error) {
    console.error('키워드 수집 에러 상세:', error);
    if (error instanceof Error) {
      console.error('에러 스택:', error.stack);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '키워드 수집 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 