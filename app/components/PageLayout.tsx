'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import NavTabs from './NavTabs';

type PageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <main className="app-shell">
      <div className="top-bar">
        <Link href="/" className="nav-brand">Helper</Link>
        <NavTabs />
        <ThemeToggle />
      </div>

      <header className="page-header">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </header>

      <section id="main" className="content">{children}</section>
    </main>
  );
}
