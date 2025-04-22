import { NextResponse } from 'next/server';
import { startScheduler } from '../../lib/scheduler';

export async function GET() {
  try {
    startScheduler();
    return NextResponse.json({ message: '스케줄러가 시작되었습니다.' });
  } catch (error) {
    console.error('스케줄러 시작 중 오류 발생:', error);
    return NextResponse.json(
      { error: '스케줄러 시작 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 