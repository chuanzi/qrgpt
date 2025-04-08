import Navbar from '@/components/Navbar';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import PlausibleProvider from 'next-plausible';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

let title = 'ArtSpark - AI Creative Image Generation';
let description =
  'Spark Your Creativity: Generate Stunning AI Art in Seconds - Artistic QR Codes, Gingerbread Figures, and more.';
let url = 'https://artspark.space';
let ogimage = 'https://artspark.space/og-image.png';
let sitename = 'ArtSpark';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain="artspark.space" />
      </head>
      <body className={inter.className}>
        <Navbar />
        {/* Google Analytics using next/script */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-EN73MPNPQC`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EN73MPNPQC');
            `,
          }}
        />
        <main>{children}</main>
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
