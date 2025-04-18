import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const { id } = context.params;
    const { action } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '포스트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (action === 'like') {
      post.likes += 1;
    } else if (action === 'unlike' && post.likes > 0) {
      post.likes -= 1;
    }

    await post.save();

    return NextResponse.json({ likes: post.likes });
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    return NextResponse.json(
      { error: '좋아요 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
