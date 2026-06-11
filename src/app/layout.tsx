import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '魂番長 ～俺たちの青春伝説～ | TAMASHII BANCHOU',
  description: 'ヤンキー青春アクションアドベンチャー。鉄義市を舞台に、転入生・神崎烈が真の番長を目指す物語。',
  keywords: ['ゲーム', 'ヤンキー', '番長', 'アクション', 'ブラウザゲーム'],
  openGraph: {
    title: '魂番長 ～俺たちの青春伝説～',
    description: 'ヤンキー青春アクションアドベンチャー',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${notoSansJP.className} antialiased bg-black text-white overflow-hidden h-full`}>
        {children}
      </body>
    </html>
  );
}
