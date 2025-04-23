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

    // 카테고리별 조회수
    const viewsByCategory = await Post.aggregate([
      {
        $group: {
          _id: '$category',
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    // 일일 조회수 (최근 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const viewsByDate = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          views: { $sum: '$views' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return NextResponse.json({
      totalPosts,
      totalComments,
      topPosts: topPosts.map(post => ({
        id: post._id,
        title: post.title,
        views: post.views
      })),
      recentComments: recentComments
        .filter(comment => comment.postId)
        .map(comment => ({
          id: comment._id,
          content: comment.content,
          author: comment.author,
          postId: comment.postId?._id || 'deleted',
          postTitle: comment.postId?.title || '삭제된 게시글',
          createdAt: comment.createdAt
        })),
      viewsByCategory: {
        trend: viewsByCategory.find(cat => cat._id === 'trend')?.totalViews || 0,
        coupang: viewsByCategory.find(cat => cat._id === 'coupang')?.totalViews || 0
      },
      viewsByDate: viewsByDate.map(item => ({
        date: item._id,
        views: item.views
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