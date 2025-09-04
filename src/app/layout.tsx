import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://viewportly.app';
const logoUrl = 'https://res.cloudinary.com/dodzjp0gr/image/upload/v1756963502/file_00000000c84c61faa74dc7edaca5951c_fvtohm.png';

export const metadata: Metadata = {
  title: 'ViewPortly - Responsive Preview Tool',
  description: 'Instantly preview any website on mobile, tablet, and desktop resolutions. A free tool for developers and designers to test responsive design.',
  keywords: ['responsive design', 'viewport', 'preview tool', 'developer tool', 'web design', 'mobile preview', 'tablet preview'],
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ViewPortly - Responsive Preview Tool',
    description: 'Instantly preview any website across a range of popular device sizes and custom resolutions.',
    url: appUrl,
    siteName: 'ViewPortly',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'ViewPortly Responsive Preview Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ViewPortly - Responsive Preview Tool',
    description: 'Instantly preview any website across a range of popular device sizes and custom resolutions.',
    images: [logoUrl],
  },
  icons: {
    icon: logoUrl,
  }
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
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
