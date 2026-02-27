'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type PageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const NAV_ITEMS = [
  { href: '/course-grade', label: 'Course Grade' },
  { href: '/syllabus', label: 'Syllabus' },
  { href: '/scientific', label: 'Scientific' },
  { href: '/gpa', label: 'GPA' },
  { href: '/final-target', label: 'Final Target' },
];

export default function PageLayout({ title, description, children }: PageLayoutProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [gliderStyle, setGliderStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const updateGlider = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeEl = nav.querySelector<HTMLElement>('.pill-tab.active');
    if (!activeEl) {
      setGliderStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    setGliderStyle({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    updateGlider();
    window.addEventListener('resize', updateGlider);
    return () => window.removeEventListener('resize', updateGlider);
  }, [pathname, updateGlider]);

  return (
    <main className="app-shell">
      <div className="top-bar">
        <Link href="/" className="nav-brand">Campus Suite</Link>
        <nav className="pill-tabs" ref={navRef} aria-label="Calculator sections">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`pill-tab${pathname === item.href ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          <span
            className="glider"
            style={{
              left: gliderStyle.left,
              width: gliderStyle.width,
              opacity: gliderStyle.opacity,
            }}
          />
        </nav>
      </div>

      <header className="page-header">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </header>

      <section className="content">{children}</section>
    </main>
  );
}
