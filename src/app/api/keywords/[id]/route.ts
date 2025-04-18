
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const keyword = await KeywordCache.findByIdAndDelete(params.id);

    if (!keyword) {
      return NextResponse.json({ error: '키워드를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '키워드 삭제 성공' });
  } catch (err) {
    console.error('삭제 오류:', err);
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 });
  }
}
