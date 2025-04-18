import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const { id } = context.params;

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('포스트 조회 오류:', error);
    return NextResponse.json(
      { error: '포스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const { id } = context.params;
    const body = await request.json();

    const post = await Post.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('포스트 수정 오류:', error);
    return NextResponse.json(
      { error: '포스트 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const { id } = context.params;

    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '포스트가 삭제되었습니다.' });
  } catch (error) {
    console.error('포스트 삭제 오류:', error);
    return NextResponse.json(
      { error: '포스트 삭제에 실패했습니다.' },
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

