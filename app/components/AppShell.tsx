'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import { ExternalLink, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TOOL_LINKS,
  RESOURCE_LINKS,
  AITU_SERVICE_LINKS,
  MOBILE_NAV_ID,
} from '@/app/lib/navigation';
import { isActivePath } from '@/app/lib/pathUtils';
import { useMobileMenu } from '@/app/lib/useMobileMenu';
import AituMark from './AituMark';
import ThemeToggle from './ThemeToggle';
import NavLink from './NavLink';
import MobileMenuButton from './MobileMenuButton';
import SidebarBackdrop from './SidebarBackdrop';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useMobileMenu();

  const currentItem = useMemo(
    () => TOOL_LINKS.find((item) => isActivePath(pathname, item.href)),
    [pathname],
  );
  const currentLabel = currentItem?.label ?? 'Overview';

  const handleCloseSidebar = () => setMobileOpen(false);
  const handleToggleSidebar = () => setMobileOpen((prev) => !prev);

  return (
    <div className="app-frame">
      <SidebarBackdrop isVisible={mobileOpen} onClick={handleCloseSidebar} />

      <Sidebar
        pathname={pathname}
        mobileOpen={mobileOpen}
        onCloseSidebar={handleCloseSidebar}
      />

      <div className="app-frame__body">
        <MobileHeader
          currentLabel={currentLabel}
          mobileOpen={mobileOpen}
          onToggleSidebar={handleToggleSidebar}
        />

        <main id="main" className="app-frame__content">
          {children}
        </main>
      </div>
    </div>
  );
}

type SidebarProps = {
  pathname: string;
  mobileOpen: boolean;
  onCloseSidebar: () => void;
};

function Sidebar({ pathname, mobileOpen, onCloseSidebar }: SidebarProps) {
  return (
    <aside
      id={MOBILE_NAV_ID}
      className={cn('app-sidebar', mobileOpen && 'app-sidebar--open')}
      aria-label="Sidebar"
    >
      <div className="app-sidebar__inner">
        <SidebarBrand onClose={onCloseSidebar} />

        <section className="app-sidebar__section">
          <span className="app-sidebar__label">Pages</span>
          <nav className="app-sidebar__nav" aria-label="Main navigation">
            {TOOL_LINKS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onCloseSidebar}
              />
            ))}
          </nav>
        </section>

        <section className="app-sidebar__section">
          <span className="app-sidebar__label">Portals</span>
          <div className="app-sidebar__nav">
            {AITU_SERVICE_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="app-sidebar__service-link"
                onClick={onCloseSidebar}
              >
                <span className="app-sidebar__service-logo" aria-hidden="true">
                  <AituMark className="h-5 w-5" />
                </span>
                <span className="app-sidebar__service-copy">
                  <strong>{item.label}</strong>
                </span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section className="app-sidebar__section">
          <span className="app-sidebar__label">Campus links</span>
          <div className="app-sidebar__nav">
            {RESOURCE_LINKS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onCloseSidebar}
              />
            ))}
          </div>
        </section>

        <SidebarFooter />
      </div>
    </aside>
  );
}

type SidebarBrandProps = {
  onClose: () => void;
};

function SidebarBrand({ onClose }: SidebarBrandProps) {
  return (
    <div className="app-sidebar__brand-row">
      <Link href="/" className="app-sidebar__brand" onClick={onClose}>
        <span className="app-sidebar__brand-badge">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="app-sidebar__brand-copy">
          <strong>AITU Tools</strong>
        </span>
      </Link>
      <button
        type="button"
        className="app-sidebar__close"
        aria-label="Close menu"
        onClick={onClose}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="app-sidebar__footer">
      <div className="app-sidebar__theme">
        <div>
          <span className="app-sidebar__label">Theme</span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

type MobileHeaderProps = {
  currentLabel: string;
  mobileOpen: boolean;
  onToggleSidebar: () => void;
};

function MobileHeader({ currentLabel, mobileOpen, onToggleSidebar }: MobileHeaderProps) {
  return (
    <header className="app-mobile-bar">
      <MobileMenuButton isOpen={mobileOpen} onClick={onToggleSidebar} />
      <div className="app-mobile-bar__copy">
        <strong>{currentLabel}</strong>
      </div>
      <ThemeToggle />
    </header>
  );
}
