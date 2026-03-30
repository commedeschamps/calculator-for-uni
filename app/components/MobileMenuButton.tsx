'use client';

import { Menu } from 'lucide-react';
import { MOBILE_NAV_ID } from '@/app/lib/navigation';

type MobileMenuButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export default function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      className="app-mobile-bar__menu"
      aria-controls={MOBILE_NAV_ID}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      onClick={onClick}
    >
      <Menu className="h-4 w-4" />
    </button>
  );
}
