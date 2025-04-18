import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    await connectDB();
    const result = await KeywordCache.findByIdAndDelete(params.id);
    
    if (!result) {
      return new Response(
        JSON.stringify({ error: '키워드를 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: '키워드가 삭제되었습니다.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('키워드 삭제 오류:', error);
    return new Response(
      JSON.stringify({ error: '키워드 삭제 중 오류가 발생했습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
