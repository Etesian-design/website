/**
 * Navigation between site content, provided by whichever shell is showing it:
 * the desktop opens a window, the phone opens an app page, the classic page scrolls to the section.
 */
import { inject, provide, type InjectionKey } from 'vue';
import type { Router } from 'vue-router';

/** a page id or "try-phone" */
export type Target = string;
export interface SiteNav { open: (t: Target) => void; shell: 'desktop' | 'phone' | 'classic' }
const KEY: InjectionKey<SiteNav> = Symbol('site-nav');
export const provideNav = (nav: SiteNav) => provide(KEY, nav);
export const useNav = (): SiteNav => inject(KEY, { open: () => undefined, shell: 'classic' });
/** true for anything shown inside the desktop view, the phone window there included */
const IN_DESKTOP: InjectionKey<boolean> = Symbol('site-in-desktop');
export const provideInDesktop = () => provide(IN_DESKTOP, true);
export const useInDesktop = (): boolean => inject(IN_DESKTOP, false);
/** content targets: URLs leave the shell ("https://…" in a new tab, "/…" site routes), anything else is a page id or "try-phone" */
export function go(nav: SiteNav, target: string, router: Router) {
  if (/^https?:/.test(target)) window.open(target, '_blank', 'noopener');
  else if (target.startsWith('/')) void router.push(target);
  else nav.open(target);
}
