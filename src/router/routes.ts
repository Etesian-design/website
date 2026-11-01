import type { RouteRecordRaw } from 'vue-router';

/**
 * /          the website: a normal scrolling page, on every screen
 * /try       try Etesian in the browser: the desktop on wide screens, the phone UI on narrow ones
 * /desktop   force the desktop     /phone  force the phone UI
 * /classic   the old address of the website
 */
const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/pages/ClassicPage.vue') },
  { path: '/try', component: () => import('@/pages/OsPage.vue') },
  { path: '/desktop', component: () => import('@/pages/OsPage.vue'), props: { force: 'desktop' } },
  { path: '/phone', component: () => import('@/pages/OsPage.vue'), props: { force: 'phone' } },
  { path: '/classic', redirect: '/' },
  { path: '/:catchAll(.*)*', redirect: '/' },
];
export default routes;
