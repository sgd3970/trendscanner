import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import View from '@/models/View';
import Post from '@/models/Post';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    try {
      await View.create({
        postId: post._id,
        ip,
        userAgent,
      });
    } catch (error: any) {
      // 중복 조회수는 무시
      if (error.code !== 11000) {
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('조회수 증가 오류:', error);
    return NextResponse.json(
      { error: '조회수 증가에 실패했습니다.' },
      { status: 500 }
    );
  }
} 