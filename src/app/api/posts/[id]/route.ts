import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '포스트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);
    console.log('데이터베이스에서 가져온 포스트:', post); // 데이터베이스 조회 결과 로깅

    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const responseData = {
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      keywords: post.keywords || [],
      views: post.views || 0,
      likes: post.likes || 0,
      imageUrl: post.imageUrl,
      slug: post.slug
    };

    console.log('클라이언트로 보내는 응답:', responseData); // API 응답 데이터 로깅

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: '포스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: '포스트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '포스트가 삭제되었습니다.' });
  } catch (error) {
    console.error('포스트 삭제 에러:', error);
    return NextResponse.json(
      { error: '포스트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 좋아요 수 증가
    post.likes += 1;
    await post.save();

    return NextResponse.json({ likes: post.likes });
  } catch (error) {
    console.error('좋아요 처리 에러:', error);
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

