import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://viewportly.app';
const logoUrl = 'https://res.cloudinary.com/dodzjp0gr/image/upload/v1756963502/file_00000000c84c61faa74dc7edaca5951c_fvtohm.png';

export const metadata: Metadata = {
  title: 'ViewPortly - Ultimate Responsive Design Preview Tool',
  description: 'Test and preview any website on a wide range of devices. ViewPortly is the ultimate free tool for developers and designers to ensure their web applications are fully responsive.',
  keywords: ['responsive design checker', 'viewport tester', 'website preview tool', 'mobile friendly test', 'cross device testing', 'developer tools', 'web design', 'UI testing', 'screen resolution simulator'],
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ViewPortly - Ultimate Responsive Design Preview Tool',
    description: 'Instantly preview any website across mobile, tablet, and desktop viewports. The essential tool for modern web development.',
    url: appUrl,
    siteName: 'ViewPortly',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'ViewPortly - Responsive Design Preview Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ViewPortly - Ultimate Responsive Design Preview Tool',
    description: 'Instantly preview any website across mobile, tablet, and desktop viewports. The essential tool for modern web development.',
    images: [logoUrl],
  },
  icons: {
    icon: '/favicon.ico?v=1',
    shortcut: '/favicon.ico?v=1',
    apple: '/apple-touch-icon.png?v=1',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link rel="icon" href={logoUrl} sizes="any" />
        <link rel="apple-touch-icon" href={logoUrl} />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
