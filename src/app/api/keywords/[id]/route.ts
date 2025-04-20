import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import KeywordCache from '@/models/KeywordCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    await connectDB();
    
    if (!params.id) {
      return new Response(
        JSON.stringify({ error: '키워드 ID가 필요합니다.' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await KeywordCache.findByIdAndDelete(params.id);
    
    if (!result) {
      return new Response(
        JSON.stringify({ error: '키워드를 찾을 수 없습니다.' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '키워드가 삭제되었습니다.',
        deletedId: params.id
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('키워드 삭제 오류:', error);
    return new Response(
      JSON.stringify({
        error: '키워드 삭제 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
