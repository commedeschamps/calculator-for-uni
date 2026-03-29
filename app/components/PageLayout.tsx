'use client';

import { type ReactNode } from 'react';

type PageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>{title}</h1>
      </header>

      <section className="content">{children}</section>
    </div>
  );
}
