import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';

interface RouteParams {
  params: {
    id: string;
    commentId: string;
  };
}

// 댓글 삭제 (소프트 삭제)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const comment = await Comment.findById(params.commentId);

    if (!comment) {
      return NextResponse.json(
        { error: '해당 댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (comment.postId.toString() !== params.id) {
      return NextResponse.json(
        { error: '잘못된 접근입니다.' },
        { status: 400 }
      );
    }

    comment.isDeleted = true;
    await comment.save();

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('댓글 삭제 에러:', error);
    return NextResponse.json(
      { error: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 