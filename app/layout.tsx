import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import GlobalNumberInputFocus from './components/GlobalNumberInputFocus';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Suite',
  description: 'Academic calculator tools — course grades, GPA, scientific calculator, and more.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <GlobalNumberInputFocus />
        {children}
      </body>
    </html>
  );
}
