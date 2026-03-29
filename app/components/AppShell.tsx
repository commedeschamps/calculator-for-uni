'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Home,
  MapPinned,
  Menu,
  Target,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  external?: boolean;
};

const TOOL_LINKS: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/schedule',
    label: 'Schedule',
    icon: CalendarDays,
  },
  {
    href: '/map',
    label: 'Campus Map',
    icon: MapPinned,
  },
  {
    href: '/course-grade',
    label: 'Course Grade',
    icon: FileSpreadsheet,
  },
  {
    href: '/gpa',
    label: 'GPA Calculator',
    icon: BarChart3,
  },
  {
    href: '/final-target',
    label: 'Final Target',
    icon: Target,
  },
  {
    href: '/syllabus',
    label: 'Syllabus Builder',
    icon: FileText,
  },
  {
    href: '/help',
    label: 'AITU Guide',
    icon: Building2,
  },
];

const RESOURCE_LINKS: NavItem[] = [
  {
    href: 'https://yuujiso.github.io/aitumap/',
    label: 'Original Map',
    icon: ExternalLink,
    external: true,
  },
  {
    href: 'https://astanait.edu.kz',
    label: 'AITU Site',
    icon: ExternalLink,
    external: true,
  },
];

const AITU_SERVICE_LINKS = [
  {
    href: 'https://lms.astanait.edu.kz/',
    label: 'AITU LMS',
  },
  {
    href: 'https://du.astanait.edu.kz/',
    label: 'AITU DU',
  },
] as const;

const AITU_FAVICON_URL = 'https://lms.astanait.edu.kz/favicon.ico';

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = !item.external && isActivePath(pathname, item.href);
  const Icon = item.icon;
  const className = cn('app-sidebar__link', active && 'app-sidebar__link--active');

  if (item.external) {
    return (
      <a
        className={className}
        href={item.href}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
      >
        <span className="app-sidebar__link-icon">
          <Icon className="h-4 w-4" />
        </span>
        <span className="app-sidebar__link-copy">
          <strong>{item.label}</strong>
        </span>
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
    >
      <span className="app-sidebar__link-icon">
        <Icon className="h-4 w-4" />
      </span>
      <span className="app-sidebar__link-copy">
        <strong>{item.label}</strong>
      </span>
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen]);

  const currentLabel = useMemo(() => {
    const current = TOOL_LINKS.find((item) => isActivePath(pathname, item.href));
    return current?.label ?? 'AITU Tools';
  }, [pathname]);

  return (
    <div className="app-frame">
      <button
        type="button"
        aria-label="Close sidebar"
        className={cn('app-sidebar-backdrop', mobileOpen && 'app-sidebar-backdrop--visible')}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={cn('app-sidebar', mobileOpen && 'app-sidebar--open')}>
        <div className="app-sidebar__inner">
          <div className="app-sidebar__brand-row">
            <Link href="/" className="app-sidebar__brand" onClick={() => setMobileOpen(false)}>
              <span className="app-sidebar__brand-badge">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="app-sidebar__brand-copy">
                <strong>AITU Tools</strong>
                <small>{currentLabel}</small>
              </span>
            </Link>
            <button
              type="button"
              className="app-sidebar__close"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <section className="app-sidebar__section">
            <span className="app-sidebar__label">Tools</span>
            <nav className="app-sidebar__nav" aria-label="Main navigation">
              {TOOL_LINKS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </nav>
          </section>

          <section className="app-sidebar__section">
            <span className="app-sidebar__label">Links</span>
            <div className="app-sidebar__nav">
              {RESOURCE_LINKS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </section>

          <div className="app-sidebar__footer">
            <div className="app-sidebar__theme">
              <div>
                <span className="app-sidebar__label">Appearance</span>
              </div>
              <ThemeToggle />
            </div>

            <div className="app-sidebar__services">
              <span className="app-sidebar__label">AITU</span>
              <div className="app-sidebar__service-list">
                {AITU_SERVICE_LINKS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="app-sidebar__service-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Image
                      src={AITU_FAVICON_URL}
                      alt="AITU"
                      width={20}
                      height={20}
                      unoptimized
                      className="app-sidebar__service-logo"
                    />
                    <span className="app-sidebar__service-copy">
                      <strong>{item.label}</strong>
                    </span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-frame__body">
        <header className="app-mobile-bar">
          <button
            type="button"
            className="app-mobile-bar__menu"
            aria-label="Open sidebar"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="app-mobile-bar__copy">
            <strong>AITU Tools</strong>
            <span>{currentLabel}</span>
          </div>
          <ThemeToggle />
        </header>

        <main id="main" className="app-frame__content">
          {children}
        </main>
      </div>
    </div>
  );
}
