import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const { id } = context.params;

    const comments = await Comment.find({ postId: id })
      .sort({ createdAt: -1 })
      .select('content author createdAt');

    return NextResponse.json(comments);
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    return NextResponse.json(
      { error: '댓글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = context.params;
    const body = await request.json();

    if (!body.content || !body.author) {
      return NextResponse.json(
        { error: '내용과 작성자는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    await connectDB();

    const comment = await Comment.create({
      postId: id,
      content: body.content,
      author: body.author,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

