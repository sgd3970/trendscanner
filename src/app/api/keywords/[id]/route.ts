import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest } from 'next';
import type { NextRequest as NextAppRequest } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher'; // 요게 중요!

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params } // ✅ 이렇게 하면 타입 검사를 통과합니다
) {
  try {
    await connectDB();

    const keyword = await KeywordCache.findByIdAndDelete(params.id);

    if (!keyword) {
      return NextResponse.json({ error: '키워드를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '키워드가 삭제되었습니다.' });
  } catch (error) {
    console.error('삭제 오류:', error);
    return NextResponse.json({ error: '삭제 중 오류 발생' }, { status: 500 });
  }
}
