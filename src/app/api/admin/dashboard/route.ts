import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET() {
  try {
    await connectDB();

    // 총 포스트 수
    const totalPosts = await Post.countDocuments();
    
    // 총 댓글 수
    const totalComments = await Comment.countDocuments();
    
    // 인기 게시글 (조회수 기준 상위 5개)
    const topPosts = await Post.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title views _id');
    
    // 최근 댓글 (최근 5개)
    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postId', 'title')
      .select('content author createdAt postId');

    return NextResponse.json({
      totalPosts,
      totalComments,
      topPosts: topPosts.map(post => ({
        id: post._id,
        title: post.title,
        views: post.views
      })),
      recentComments: recentComments
        .filter(comment => comment.postId) // null인 postId 필터링
        .map(comment => ({
          id: comment._id,
          content: comment.content,
          author: comment.author,
          postId: comment.postId?._id || 'deleted',
          postTitle: comment.postId?.title || '삭제된 게시글',
          createdAt: comment.createdAt
        }))
    });
  } catch (error) {
    console.error('대시보드 데이터 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '대시보드 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 