// Quasar CLI (Vite) configuration for the Etesian website.
import { defineConfig } from '@quasar/app-vite';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

/** The design repo (../etesian-design), consumed through the local `etesian-design` dependency. */
const designRoot = realpathSync(fileURLToPath(new URL('./node_modules/etesian-design', import.meta.url)));

export default defineConfig(() => ({
  boot: ['etesian'],
  css: ['app.scss'],
  extras: [],
  build: {
    target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari15'], node: 'node20' },
    // history: every route is its own generated page (quasar build -m ssg)
    vueRouterMode: 'history',
    typescript: { strict: true, vueShim: true },
    alias: {
      // Design-system source: Hd* components, tokens, and the approved Storybook parts (desktop v2, phone parts, Belle widgets).
      '@etesian': `${designRoot}/src`,
    },
    extendViteConf(viteConf) {
      viteConf.resolve ??= {};
      // the design repo has its own node_modules; make sure there is only one Vue and one Quasar
      (viteConf.resolve as { dedupe?: string[] }).dedupe = ['vue', 'quasar'];
      viteConf.server ??= {};
      viteConf.server.fs = { ...(viteConf.server.fs ?? {}), allow: [fileURLToPath(new URL('.', import.meta.url)), designRoot] };
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
