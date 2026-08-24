import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Rubik_Mono_One } from 'next/font/google';
import { Providers } from './providers';
import ToastContainer from '@/components/ui/toast-container';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-header',
  display: 'swap',
});

const rubikMonoOne = Rubik_Mono_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-combo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TikTok Live Overlay Engine',
  description: 'Real-time TikTok Live stream overlay system with gift effects, particle animations, and OBS integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* FontAwesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* Persistent Theme Initialization Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme_preference') === 'light') {
                  document.documentElement.classList.add('light-mode');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${rubikMonoOne.variable} antialiased`}>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
