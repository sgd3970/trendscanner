import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '트렌드스캐너',
  description: '최신 트렌드와 리뷰를 한눈에',
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
        <meta name="naver-site-verification" content="00b7bed801bffcea59569b4b40cfe20f2227fd44" />
        <meta name="google-site-verification" content="MWziquIMM3rKz13WfDcm08INXd5085FqqebR2TZ572g" />
      </head>
      <body className={inter.className}>
        <Header />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
