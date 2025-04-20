import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 쿠키 삭제를 위한 응답 생성
    const response = NextResponse.json({ success: true });
    
    // 모든 쿠키 삭제
    response.cookies.set('isAdmin', '', { maxAge: 0 });
    response.cookies.set('token', '', { maxAge: 0 });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 