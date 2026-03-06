'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

type GliderStyle = {
  x: number;
  width: number;
  opacity: number;
};

const HIDDEN_GLIDER_STYLE: GliderStyle = { x: 0, width: 0, opacity: 0 };

let cachedGliderStyle: GliderStyle | null = null;

export default function NavTabs() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const mountedWithCachedGlider = useRef(cachedGliderStyle !== null);
  const [gliderStyle, setGliderStyle] = useState<GliderStyle>(() => cachedGliderStyle ?? HIDDEN_GLIDER_STYLE);
  const [gliderReady, setGliderReady] = useState(mountedWithCachedGlider.current);
  const [scrollLeft, setScrollLeft] = useState(false);
  const [scrollRight, setScrollRight] = useState(false);

  const measureGlider = useCallback((): GliderStyle => {
    const nav = navRef.current;
    if (!nav) return HIDDEN_GLIDER_STYLE;

    const activeEl = nav.querySelector<HTMLElement>('.pill-tab.active');
    if (!activeEl) {
      return HIDDEN_GLIDER_STYLE;
    }

    const navRect = nav.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();

    return {
      x: tabRect.left - navRect.left + nav.scrollLeft,
      width: tabRect.width,
      opacity: 1,
    };
  }, []);

  const commitGlider = useCallback((nextStyle: GliderStyle) => {
    cachedGliderStyle = nextStyle.opacity > 0 ? nextStyle : null;
    setGliderStyle((prev) => {
      if (
        prev.x === nextStyle.x &&
        prev.width === nextStyle.width &&
        prev.opacity === nextStyle.opacity
      ) {
        return prev;
      }

      return nextStyle;
    });
  }, []);

  const scheduleGliderUpdate = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      commitGlider(measureGlider());
    });
  }, [commitGlider, measureGlider]);

  const updateScrollFade = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    setScrollLeft(nav.scrollLeft > 4);
    setScrollRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4);
  }, []);

  useLayoutEffect(() => {
    if (mountedWithCachedGlider.current) {
      return;
    }

    commitGlider(measureGlider());

    const readyFrame = requestAnimationFrame(() => {
      setGliderReady(true);
    });

    return () => {
      cancelAnimationFrame(readyFrame);
    };
  }, [commitGlider, measureGlider]);

  useEffect(() => {
    scheduleGliderUpdate();
    updateScrollFade();

    const nav = navRef.current;
    if (!nav) return;

    let resizeObserver: ResizeObserver | null = null;
    const activeEl = nav.querySelector<HTMLElement>('.pill-tab.active');

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scheduleGliderUpdate();
        updateScrollFade();
      });
      resizeObserver.observe(nav);
      if (activeEl) {
        resizeObserver.observe(activeEl);
      }
    }

    window.addEventListener('resize', scheduleGliderUpdate);
    window.addEventListener('resize', updateScrollFade);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleGliderUpdate);
      window.removeEventListener('resize', updateScrollFade);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [scheduleGliderUpdate, updateScrollFade]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    scheduleGliderUpdate();
    const activeEl = nav.querySelector<HTMLElement>('.pill-tab.active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    nav.addEventListener('scroll', updateScrollFade, { passive: true });
    return () => {
      nav.removeEventListener('scroll', updateScrollFade);
    };
  }, [pathname, scheduleGliderUpdate, updateScrollFade]);

  const wrapClass = `pill-tabs-wrap${scrollLeft ? ' pill-tabs-wrap--scroll-left' : ''}${scrollRight ? ' pill-tabs-wrap--scroll-right' : ''}`;

  return (
    <div className={wrapClass}>
      <nav className="pill-tabs" ref={navRef} aria-label="Calculator sections">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`pill-tab${pathname === item.href ? ' active' : ''}`}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
        <span
          className={`glider${gliderReady ? ' glider--ready' : ''}`}
          style={{
            transform: `translate3d(${gliderStyle.x}px, 0, 0)`,
            width: gliderStyle.width,
            opacity: gliderStyle.opacity,
          }}
        />
      </nav>
    </div>
  );
}
