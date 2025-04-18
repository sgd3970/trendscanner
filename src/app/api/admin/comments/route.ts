import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET() {
  try {
    await connectDB();
    const comments = await Comment.find().sort({ createdAt: -1 });
    return NextResponse.json(comments);
  } catch (_) {
    return NextResponse.json(
      { error: '댓글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isApproved } = await request.json();
    await connectDB();
    
    const comment = await Comment.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (_) {
    return NextResponse.json(
      { error: '댓글 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await connectDB();
    
    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
  } catch (_) {
    return NextResponse.json(
      { error: '댓글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 