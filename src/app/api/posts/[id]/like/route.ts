import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
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
      post.likes = (post.likes || 0) + 1;
    } else if (action === 'unlike') {
      post.likes = Math.max(0, (post.likes || 0) - 1);
    }

    await post.save();

    return NextResponse.json({
      likes: post.likes
    });
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json(
      { error: '좋아요 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
