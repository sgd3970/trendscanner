import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '트렌드스캐너 | 실시간 트렌드 포스팅 플랫폼',
  description: '트렌드스캐너는 오늘의 핫한 키워드와 최신 이슈를 실시간으로 정리한 블로그 포스팅을 제공하는 플랫폼입니다.',
  keywords: '트렌드, 실시간 키워드, 오늘의 이슈, 핫이슈, 블로그, 자동 포스팅',
  authors: [{ name: 'TrendScanner Team' }],
  openGraph: {
    title: '트렌드스캐너',
    description: '지금 가장 주목받는 키워드를 블로그 형식으로 한눈에 확인해보세요!',
    url: 'https://trend-scanner.com',
    siteName: '트렌드스캐너',
    images: [
      {
        url: 'https://trend-scanner.com/thumbnail.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="google-adsense-account" content="ca-pub-8478624096187058"></meta>
        <meta name="naver-site-verification" content="6670b67e74a4ff1fa8758f516c7ee9fa362a7f0a" />
        <meta name="google-site-verification" content="MWziquIMM3rKz13WfDcm08INXd5085FqqebR2TZ572g" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
