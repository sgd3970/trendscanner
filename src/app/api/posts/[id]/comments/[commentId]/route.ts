import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const { id, commentId } = context.params;

    const deleted = await Comment.findOneAndDelete({
      _id: commentId,
      postId: id,
    });

    if (!deleted) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return NextResponse.json({ error: '댓글 삭제 실패' }, { status: 500 });
  }
} 