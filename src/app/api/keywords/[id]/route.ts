import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteSegment {
  params: { id: string }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteSegment
): Promise<NextResponse> {
  try {
    await connectDB();
    const result = await KeywordCache.findByIdAndDelete(params.id);
    
    if (!result) {
      return NextResponse.json(
        { error: '키워드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '키워드가 삭제되었습니다.' });
  } catch (error) {
    console.error('키워드 삭제 오류:', error);
    return NextResponse.json(
      { error: '키워드 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
