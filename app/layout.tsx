import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AppShell from './components/AppShell';
import GlobalNumberInputFocus from './components/GlobalNumberInputFocus';
import ThemeProvider from './components/ThemeProvider';
import ToastProvider from './components/ToastProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'AITU Tools',
  description: 'AITU schedule, map, grades, GPA, and syllabus.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <ThemeProvider>
          <ToastProvider>
            <GlobalNumberInputFocus />
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
