/**
 * Navigation Configuration
 * Central place for all navigation-related constants and types
 */

import {
  BarChart3,
  Building2,
  CalendarDays,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Home,
  MapPinned,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Navigation item definition
 * @property href - URL path or external link
 * @property label - Display name for the navigation item
 * @property icon - Lucide React icon component
 * @property external - Optional flag for external links (opens in new tab)
 */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
};

/**
 * Main application tools/pages
 * Rendered in sidebar and used for mobile navigation
 */
export const TOOL_LINKS: NavItem[] = [
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

/**
 * External resource links
 * Displayed in sidebar under "Campus links"
 */
export const RESOURCE_LINKS: NavItem[] = [
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

/**
 * AITU service links with branding
 * Displayed in sidebar footer under "Portals"
 */
export const AITU_SERVICE_LINKS = [
  {
    href: 'https://lms.astanait.edu.kz/',
    label: 'Moodle',
  },
  {
    href: 'https://du.astanait.edu.kz/',
    label: 'DU',
  },
] as const;

/**
 * Mobile/Desktop breakpoint for responsive sidebar
 * Desktop: fixed sidebar visible
 * Mobile: sidebar in drawer, hamburger menu visible
 */
export const DESKTOP_SIDEBAR_BREAKPOINT = '(min-width: 981px)';

/**
 * ID for mobile navigation element
 * Used for accessibility (aria-controls)
 */
export const MOBILE_NAV_ID = 'aitu-sidebar-navigation';
