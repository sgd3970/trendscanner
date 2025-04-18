import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';

export async function GET() {
  try {
    await connectDB();

    // 모든 댓글을 가져오되, 게시글 제목도 함께 가져옵니다.
    const comments = await Comment.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: '_id',
          as: 'post'
        }
      },
      {
        $unwind: '$post'
      },
      {
        $project: {
          _id: 1,
          postId: 1,
          postTitle: '$post.title',
          author: 1,
          content: 1,
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json(comments);
  } catch (error) {
    console.error('댓글 조회 중 오류:', error);
    return NextResponse.json(
      { error: '댓글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 