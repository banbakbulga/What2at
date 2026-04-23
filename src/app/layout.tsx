import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import InstallPrompt from '@/components/InstallPrompt';
import DarkModeScript from '@/components/DarkModeScript';
import './globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F4F6' },
    { media: '(prefers-color-scheme: dark)', color: '#17171C' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://what2at.vercel.app'),
  title: '점심 메뉴 월드컵',
  description: '주변 식당, 술집, 카페를 월드컵으로 골라요',
  applicationName: '점심월드컵',
  appleWebApp: {
    capable: true,
    title: '점심월드컵',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://what2at.vercel.app',
    siteName: '점심월드컵',
    title: '점심 메뉴 월드컵',
    description: '주변 식당, 술집, 카페를 월드컵으로 골라요',
    images: [
      {
        url: '/og-image.png',
        width: 1731,
        height: 909,
        alt: '점심 메뉴 월드컵',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '점심 메뉴 월드컵',
    description: '주변 식당, 술집, 카페를 월드컵으로 골라요',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-toss-bg text-toss-text antialiased dark:bg-toss-dark-bg dark:text-toss-dark-text">
        <DarkModeScript />
        <a
          href="#main-content"
          className="fixed left-2 top-2 z-[100] -translate-y-20 rounded-lg bg-[#FF7E36] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        >
          본문으로 건너뛰기
        </a>
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false`}
          strategy="afterInteractive"
        />
        <ServiceWorkerRegister />
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
