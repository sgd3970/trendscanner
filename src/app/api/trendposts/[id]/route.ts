import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    const { id } = context.params;
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }

    const post = await db.collection('trendposts').findOne({ 
      _id: new ObjectId(id)
    });

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