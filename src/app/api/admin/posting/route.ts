import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const { title, content, tags, imageUrl } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
    }

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }

    const result = await db.collection('posts').insertOne({
      title,
      content,
      tags: tags || [],
      imageUrl,
      authorId: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      commentCount: 0,
      isPublished: true,
      source: 'coupang'
    });

    return NextResponse.json({
      message: '포스트가 성공적으로 생성되었습니다.',
      postId: result.insertedId
    });
  } catch (error) {
    console.error('포스트 생성 오류:', error);
    return NextResponse.json(
      { error: '포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 