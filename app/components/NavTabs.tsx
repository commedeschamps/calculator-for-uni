'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NAV_ITEMS = [
  { href: '/schedule', label: 'Schedule' },
  { href: '/course-grade', label: 'Course Grade' },
  { href: '/syllabus', label: 'Syllabus' },
  { href: '/gpa', label: 'GPA' },
  { href: '/final-target', label: 'Final Target' },
  { href: '/help', label: 'Guide' },
];

export default function NavTabs() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [gliderStyle, setGliderStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [scrollLeft, setScrollLeft] = useState(false);
  const [scrollRight, setScrollRight] = useState(false);

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
      left: tabRect.left - navRect.left + nav.scrollLeft,
      width: tabRect.width,
      opacity: 1,
    });
  }, []);

  const updateScrollFade = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    setScrollLeft(nav.scrollLeft > 4);
    setScrollRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateGlider();
    updateScrollFade();
    window.addEventListener('resize', updateGlider);
    window.addEventListener('resize', updateScrollFade);
    return () => {
      window.removeEventListener('resize', updateGlider);
      window.removeEventListener('resize', updateScrollFade);
    };
  }, [pathname, updateGlider, updateScrollFade]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    // Scroll active tab into view
    const activeEl = nav.querySelector<HTMLElement>('.pill-tab.active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    nav.addEventListener('scroll', updateScrollFade, { passive: true });
    return () => nav.removeEventListener('scroll', updateScrollFade);
  }, [pathname, updateScrollFade]);

  const wrapClass = `pill-tabs-wrap${scrollLeft ? ' pill-tabs-wrap--scroll-left' : ''}${scrollRight ? ' pill-tabs-wrap--scroll-right' : ''}`;

  return (
    <div className={wrapClass} ref={wrapRef}>
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
  );
}
