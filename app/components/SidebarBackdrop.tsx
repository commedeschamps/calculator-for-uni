'use client';

import { cn } from '@/lib/utils';

type SidebarBackdropProps = {
  isVisible: boolean;
  onClick: () => void;
};

export default function SidebarBackdrop({ isVisible, onClick }: SidebarBackdropProps) {
  return (
    <button
      type="button"
      aria-label="Close navigation"
      className={cn('app-sidebar-backdrop', isVisible && 'app-sidebar-backdrop--visible')}
      onClick={onClick}
    />
  );
}
