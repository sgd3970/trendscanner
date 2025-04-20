import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = context.params;

    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가
    post.views = (post.views || 0) + 1;
    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('포스트 조회 오류:', error);
    return NextResponse.json(
      { error: '포스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 