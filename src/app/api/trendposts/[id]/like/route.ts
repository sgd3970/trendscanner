import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { action } = await request.json();
    await connectDB();
    const { id } = context.params;
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }

    const result = await db.collection('trendposts').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: action === 'like' ? 1 : -1 } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('좋아요 업데이트 오류:', error);
    return NextResponse.json(
      { error: '좋아요 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
} 