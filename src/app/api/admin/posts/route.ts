import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .select('title content createdAt views likes');

    return NextResponse.json({
      posts: posts.map(post => ({
        id: post._id,
        title: post.title,
        description: post.content.substring(0, 100) + '...',
        createdAt: post.createdAt,
        views: post.views,
        likes: post.likes
      }))
    });
  } catch (error) {
    console.error('포스트 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '포스트 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.create({
      title: body.title,
      content: body.content,
      description: body.description,
      keywords: body.keywords,
      featuredImage: body.featuredImage,
      views: 0,
      likes: 0,
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('포스트 생성 에러:', error);
    return NextResponse.json(
      { error: '포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: '삭제할 포스트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    await connectDB();
    const result = await Post.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '포스트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 