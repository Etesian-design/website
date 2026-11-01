import { defineRouter } from '#q-app';
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import routes from './routes';

/** As Quasar's SSR/SSG docs: memory history while pages are generated at build time, browser history in the browser. */
export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory;
  return createRouter({ scrollBehavior: (to) => (to.hash ? { el: to.hash, behavior: 'smooth' } : { left: 0, top: 0 }), routes, history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE) });
});
