import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!params.id) {
      return NextResponse.json(
        { error: '키워드 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await KeywordCache.findByIdAndDelete(params.id);
    
    if (!result) {
      return NextResponse.json(
        { error: '키워드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: '키워드가 삭제되었습니다.',
      deletedId: params.id
    });
  } catch (error) {
    console.error('키워드 삭제 오류:', error);
    return NextResponse.json(
      { 
        error: '키워드 삭제 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
