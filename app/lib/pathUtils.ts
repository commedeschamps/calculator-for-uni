/**
 * Check if a pathname matches a navigation href (handles base routes)
 * @param pathname Current page pathname
 * @param href Navigation link href
 * @returns true if the page is considered "active" for this link
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
