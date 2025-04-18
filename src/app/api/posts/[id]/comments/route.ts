import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '포스트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ postId: id, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .select('_id author content createdAt')
      .lean();

    return NextResponse.json(comments.map(comment => ({
      ...comment,
      _id: comment._id.toString()
    })));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: '댓글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '포스트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!body.content) {
      return NextResponse.json(
        { error: '댓글 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      postId: id,
      author: body.author || '익명',
      content: body.content,
    });

    return NextResponse.json({
      _id: comment._id.toString(),
      author: comment.author,
      content: comment.content,
      createdAt: comment.createdAt
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

