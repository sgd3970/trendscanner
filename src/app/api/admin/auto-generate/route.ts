import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { generatePost } from '@/lib/gpt';

export async function POST() {
  try {
    await connectDB();

    // GPT를 사용하여 포스트 생성
    const generatedPost = await generatePost();

    // 생성된 포스트를 데이터베이스에 저장
    const post = new Post({
      title: generatedPost.title,
      content: generatedPost.content,
      keywords: generatedPost.keywords,
      imageUrl: generatedPost.imageUrl,
    });

    await post.save();

    return NextResponse.json({
      success: true,
      message: '포스트가 성공적으로 생성되었습니다.',
      post: {
        _id: post._id,
        title: post.title,
        content: post.content,
        keywords: post.keywords,
        imageUrl: post.imageUrl,
      },
    });
  } catch (error) {
    console.error('자동 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '포스트 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
} 