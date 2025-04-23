import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import View from '@/models/View';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    // 전체 포스트 수
    const totalPosts = await Post.countDocuments();

    // 전체 댓글 수
    const totalComments = await Comment.countDocuments();

    // 인기 게시글 (조회수 기준 상위 5개)
    const topPosts = await Post.aggregate([
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'postId',
          as: 'views'
        }
      },
      {
        $addFields: {
          viewCount: { $size: '$views' }
        }
      },
      {
        $sort: { viewCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 1,
          title: 1,
          viewCount: 1
        }
      }
    ]);

    // 최근 댓글 (최근 5개)
    const recentComments = await Comment.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      },
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
          content: 1,
          author: 1,
          postId: 1,
          postTitle: '$post.title',
          createdAt: 1
        }
      }
    ]);

    // 카테고리별 조회수
    const viewsByCategory = await Post.aggregate([
      {
        $lookup: {
          from: 'views',
          localField: '_id',
          foreignField: 'postId',
          as: 'views'
        }
      },
      {
        $group: {
          _id: '$category',
          views: { $sum: { $size: '$views' } }
        }
      }
    ]);

    // 일별 조회수 (최근 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const viewsByDate = await View.aggregate([
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
          views: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          views: 1,
          _id: 0
        }
      }
    ]);

    // 카테고리별 조회수 데이터 정리
    const categoryViews = {
      trend: 0,
      coupang: 0
    };

    viewsByCategory.forEach(category => {
      if (category._id === 'trend') {
        categoryViews.trend = category.views;
      } else if (category._id === 'coupang') {
        categoryViews.coupang = category.views;
      }
    });

    return NextResponse.json({
      totalPosts,
      totalComments,
      topPosts: topPosts.map(post => ({
        id: post._id.toString(),
        title: post.title,
        views: post.viewCount
      })),
      recentComments: recentComments.map(comment => ({
        id: comment._id.toString(),
        content: comment.content,
        author: comment.author,
        postId: comment.postId.toString(),
        postTitle: comment.postTitle,
        createdAt: comment.createdAt
      })),
      viewsByCategory: categoryViews,
      viewsByDate
    });
  } catch (error) {
    console.error('대시보드 데이터 로드 오류:', error);
    return NextResponse.json(
      { error: '대시보드 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 