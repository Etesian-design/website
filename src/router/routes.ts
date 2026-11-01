import type { RouteRecordRaw } from 'vue-router';

/**
 * /          the Etesian OS in the browser: the desktop on wide screens, the phone UI on narrow ones
 * /desktop   force the desktop     /phone  force the phone UI
 * /classic   the traditional scrolling page
 */
const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/pages/OsPage.vue') },
  { path: '/desktop', component: () => import('@/pages/OsPage.vue'), props: { force: 'desktop' } },
  { path: '/phone', component: () => import('@/pages/OsPage.vue'), props: { force: 'phone' } },
  { path: '/classic', component: () => import('@/pages/ClassicPage.vue') },
  { path: '/:catchAll(.*)*', redirect: '/' },
];
export default routes;
