import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    await connectDB();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('포스트 조회 에러:', error);
    return NextResponse.json({ error: '포스트를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json({ error: '제목과 내용은 필수 입력 항목입니다.' }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findByIdAndUpdate(
      id,
      {
        title: body.title,
        content: body.content,
        description: body.description,
        keywords: body.keywords,
        featuredImage: body.featuredImage,
      },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('포스트 수정 에러:', error);
    return NextResponse.json({ error: '포스트 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    await connectDB();

    const result = await Post.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: '포스트를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('포스트 삭제 에러:', error);
    return NextResponse.json({ error: '포스트 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
