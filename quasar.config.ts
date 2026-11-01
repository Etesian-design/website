// Quasar CLI (Vite) configuration for the Etesian website.
import { defineConfig } from '@quasar/app-vite';

export default defineConfig(() => ({
  boot: ['etesian'],
  css: ['app.scss'],
  extras: [],
  build: {
    target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari15'], node: 'node20' },
    // history: every route is its own generated page (quasar build -m ssg)
    vueRouterMode: 'history',
    // "/": the site lives at the root of etesian-design.com (public/CNAME); PUBLIC_PATH only for a local test under a sub-path
    publicPath: process.env.PUBLIC_PATH || '/',
    typescript: { strict: true, vueShim: true },
    extendViteConf(viteConf) {
      viteConf.resolve ??= {};
      // one Vue and one Quasar, whatever the @etesian-design packages resolve
      (viteConf.resolve as { dedupe?: string[] }).dedupe = ['vue', 'quasar'];
    },
  },
  devServer: { port: 6120, strictPort: true, open: false },
  framework: {
    config: { dark: false },
    plugins: ['Notify', 'Meta'],
  },
  animations: [],
  ssg: {
    // GitHub Pages serves it for any address that is not a generated page
    error404HtmlFilename: '404.html',
  },
}));
