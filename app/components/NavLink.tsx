'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { isActivePath } from '@/app/lib/pathUtils';
import type { NavItem } from '@/app/lib/navigation';

type NavLinkProps = {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
};

export default function NavLink({ item, pathname, onNavigate }: NavLinkProps) {
  const active = !item.external && isActivePath(pathname, item.href);
  const Icon = item.icon;
  const className = cn('app-sidebar__link', active && 'app-sidebar__link--active');

  const linkContent = (
    <>
      <span className="app-sidebar__link-icon">
        <Icon className="h-4 w-4" />
      </span>
      <span className="app-sidebar__link-copy">
        <strong>{item.label}</strong>
      </span>
    </>
  );

  if (item.external) {
    return (
      <a
        className={className}
        href={item.href}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
      >
        {linkContent}
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
      {linkContent}
    </Link>
  );
}
