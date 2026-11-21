import type { RouteRecordRaw } from 'vue-router';
// site.json only (not site.ts): the SSG build reads the routes without Vite, so no import.meta.glob here
import index from '@/content/site.json';

/**
 * Every content page at its own address (site.json "path"), each a generated page (SSG).
 * /try          try Etesian in the browser: the desktop on wide screens, the phone UI on narrow ones
 * /try/desktop  force the desktop     /try/phone  force the phone UI
 * Old addresses: /desktop and /classic.
 */
const routes: RouteRecordRaw[] = [
  ...index.pages.filter((d) => !d.path.includes('#')).map((d): RouteRecordRaw => ({ path: d.path, component: () => import('@/pages/ClassicPage.vue'), props: { id: d.id } })),
  // the phone's sections are on /phone; their old addresses (/phone/apps, ...) go to the section
  ...index.pages.filter((d) => d.path.includes('#')).map((d): RouteRecordRaw => ({ path: `/phone/${d.id}`, redirect: { path: '/phone', hash: `#${d.id}` } })),
  { path: '/try', component: () => import('@/pages/OsPage.vue') },
  { path: '/try/desktop', component: () => import('@/pages/OsPage.vue'), props: { force: 'desktop' } },
  { path: '/try/phone', component: () => import('@/pages/OsPage.vue'), props: { force: 'phone' } },
  { path: '/desktop', redirect: '/try/desktop' },
  { path: '/classic', redirect: '/' },
  { path: '/:catchAll(.*)*', redirect: '/' },
];
export default routes;
