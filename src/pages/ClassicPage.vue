<script setup lang="ts">
/**
 * The website: one page per content page (site.json "path"), built from the design repo's web components (the "Web"
 * story: HdSiteHeader, HdHero, HdContainer, HdFooter). The home page (overview) leads with the interactive phone;
 * a page with sub-pages, or a sub-page, shows a tab bar between them. The same content opens as desktop windows and
 * phone app pages under /try.
 */
import { href } from '../lib/base';
import { computed } from 'vue';
import { useQuasar, useHydration } from 'quasar';
import { usePageMeta } from '@/lib/meta';
import { useRouter } from 'vue-router';
import HdSiteHeader from '@etesian-design/vue/components/HdSiteHeader.vue';
import HdHero from '@etesian-design/vue/components/HdHero.vue';
import HdContainer from '@etesian-design/vue/components/HdContainer.vue';
import HdFooter from '@etesian-design/vue/components/HdFooter.vue';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import XFit from '@etesian-design/shell/parts/XFit.vue';
import PhoneUI from '@/components/phone/PhoneUI.vue';
import EtesianMark from '@/components/common/EtesianMark.vue';
import { DOCS, listed, doc, pathOf } from '../content/site';
import PageRenderer from '@/components/blocks/PageRenderer.vue';
import { provideNav, type Target } from '../lib/nav';
import { onMounted } from 'vue';
import { refreshReleases, resolveTokens, resolveDeep } from '../lib/releases';

const props = withDefaults(defineProps<{ id?: string }>(), { id: 'overview' });
const $q = useQuasar();
const { isHydrated } = useHydration();
const router = useRouter();
const page = computed(() => doc(props.id));
const isHome = computed(() => props.id === 'overview');
/** the top bar: every listed page without a parent; a sub-page lights its parent */
const TOP = listed('classic').filter((d) => !d.parent);
const links = computed(() => TOP.map((d) => ({ label: d.label, href: href(d.path), icon: d.icon, current: d.id === page.value.id || d.id === page.value.parent })));
/** a sub-page links back to its parent at the top */
const parent = computed(() => (page.value.parent ? doc(page.value.parent) : null));
/** the home page is the whole site on one page: a section per listed page (its "home" blocks, else all its blocks),
 *  each ending in a link to the page with the details */
/** the home page: the original single page's sections, in its order; each title links to its page */
const HOME = ['plasma', 'phone', 'design', 'apps', 'home', 'web'];
const SECTIONS = HOME.map((id) => doc(id)).filter(Boolean).map((d) => ({
  ...d, blocks: (d.home ?? d.blocks).map((b, i) => (i === 0 && b.type === 'hero' ? { ...b, more: { label: `More about ${d.title}`, href: href(d.path) } } : b)),
}));
/** the home page's hero is its hero block; its other blocks follow the hero */
const hero = resolveDeep(doc('overview').blocks.find((b) => b.type === 'hero') ?? { title: 'Etesian' } as never) as { title: string; lead?: string; eyebrow?: string; actions?: { label: string; target: string; primary?: boolean; icon?: string }[] };
/** a page with sections (the phone): its sections follow it on the same page, one band each, like the home page */
const KIDS_ORDER = ['home', 'system', 'settings', 'apps'];
const kids = computed(() => DOCS.filter((d) => d.parent === page.value.id).sort((a, b) => KIDS_ORDER.indexOf(a.id) - KIDS_ORDER.indexOf(b.id)));
const body = computed(() => (isHome.value ? { ...page.value, blocks: page.value.blocks.filter((b) => b.type !== 'hero') } : page.value));
const footer = [
  { title: 'Etesian', links: TOP.map((d) => ({ label: d.title, href: href(d.path) })) },
  { title: 'More', links: [
    ...DOCS.filter((d) => !d.show?.classic && !d.parent && d.id !== 'overview').map((d) => ({ label: d.title, href: href(d.path) })),
    { label: 'Try the desktop', href: href('/try/desktop') }, { label: 'Try the phone', href: href('/try/phone') },
    { label: 'Design language site', href: 'https://language.etesian-design.com' },
  ] },
  { title: 'Source on GitHub', links: [
    { label: 'Phone', href: 'https://github.com/Etesian-design/android_vendor_etesian' },
    { label: 'Glance', href: 'https://github.com/Etesian-design/glance' },
    { label: 'Plasma', href: 'https://github.com/Etesian-design/plasma' },
    { label: 'Design', href: 'https://github.com/Etesian-design/design' },
    { label: 'Website', href: 'https://github.com/Etesian-design/website' },
  ] },
];
/** the footer's note; the Meeye line follows the release data */
const footNote = computed(() => resolveTokens('Etesian is an independent project, not affiliated with Nokia. The Nokia N9 (2011) is credited as its inspiration; the project holds no copyrighted material owned by Nokia or its subsidiaries. Etesian ROM builds bundle the Meeye icon pack by YeyeBBC (CC BY-NC 4.0) as the default icon pack {{rom.pending:2026-11-15}}; it is not made by the project.'));
/** the screen is only known in the browser: the generated page says "Try the desktop" until it has hydrated */
const osLabel = computed(() => (isHydrated.value && $q.screen.width < 820 ? 'Try the phone' : 'Try the desktop'));
usePageMeta(isHome.value ? 'Etesian' : `${page.value.title} · Etesian`, isHome.value ? 'Etesian, a calm, gesture-first interface inspired by the Nokia N9: a LineageOS phone ROM for the F(x)tec Pro1-X, Glance, Etesian for KDE Plasma and the design language.' : page.value.summary, page.value.path);
function open(t: Target) {
  if (t === 'try-phone' && isHome.value) { document.getElementById('sec-try')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  void router.push(pathOf(t));
}
provideNav({ open, shell: 'classic' });
/** versions and dates: the build's release data first, then the latest from GitHub */
onMounted(() => { void refreshReleases(); });
/** the site's own links go through the router (no full reload); the base path is stripped first */
const BASE = href('');
function onClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as HTMLElement).closest('a'); const h = a?.getAttribute('href');
  if (!h || a?.target === '_blank' || !h.startsWith('/') || h.startsWith('//')) return;
  e.preventDefault(); void router.push(h.slice(BASE.length) || '/');
}
</script>
<template>
  <div class="classic hd-on-page" @click="onClick">
    <HdSiteHeader brand="Etesian" tone="chrome" :brand-href="href('/')" :home-current="isHome" :links="links">
      <!-- the dark (chrome) tone, so the pearl logo -->
      <template #logo><EtesianMark :size="28" on="light" class="classic-mark--light" /><EtesianMark :size="28" on="dark" class="classic-mark--dark" /></template>
      <template #actions><HdButton variant="accent" @click="router.push('/try')">{{ osLabel }}</HdButton></template>
    </HdSiteHeader>
    <main id="main">
      <section v-if="isHome" class="classic-hero hd-on-home">
        <HdContainer size="wide" class="classic-hero__in">
          <div class="classic-hero__text">
            <div class="classic-hero__brand"><EtesianMark :size="48" on="dark" /><span>{{ hero.eyebrow }}</span></div>
            <HdHero :title="hero.title" :lead="hero.lead">
              <template #actions>
                <HdButton v-for="a in hero.actions" :key="a.label" :variant="a.primary ? 'accent' : 'default'" :icon="a.icon" @click="open(a.target)">{{ a.label }}</HdButton>
              </template>
            </HdHero>
          </div>
          <div id="sec-try" class="classic-hero__phone" aria-label="Interactive phone">
            <XFit :w="360" :h="720" fit="contain"><PhoneUI embedded :start-locked="true" @navigate="(h: string) => router.push(h)" /></XFit>
            <p class="classic-hero__cap">Interactive: swipe sideways to unlock, then tap an app. Swipe in from an edge to minimise it.</p>
          </div>
        </HdContainer>
      </section>
      <template v-if="isHome">
        <section v-for="(d, i) in SECTIONS" :id="`sec-${d.id}`" :key="d.id" class="classic-sec" :class="{ 'classic-sec--alt': i % 2 === 0 }">
          <HdContainer size="wide"><PageRenderer :page="d" /></HdContainer>
        </section>
      </template>
      <template v-else>
        <section class="classic-sec">
          <HdContainer size="wide">
            <a v-if="parent" class="classic-up hd-focusable" :href="href(parent.path)"><HdIcon name="back" :size="18" />{{ parent.title }}</a>
            <PageRenderer :key="page.id" :page="body" />
          </HdContainer>
        </section>
        <section v-for="(d, i) in kids" :id="d.id" :key="d.id" class="classic-sec" :class="{ 'classic-sec--alt': i % 2 === 0 }">
          <HdContainer size="wide"><PageRenderer :page="d" /></HdContainer>
        </section>
      </template>
    </main>
    <HdFooter :columns="footer" :note="footNote" />
  </div>
</template>
<style>
.classic { min-height: 100%; background: var(--hd-c-bg); color: var(--hd-c-fg); }
/* the header's logo matches its bar: deep blue on the light one, pearl on the dark (chrome) one */
/* Design library 0.15.0 made the header and its phone bottom bar see-through by colour-mixing --hd-surface-chrome,
   which is a gradient in the hybrid mode, so the mix is invalid and both bars came out fully transparent: white links
   over the light sections. The same see-through look with the chrome gradient's own colours, at --hd-opacity-chrome
   and a little more for the white text's contrast; the blur comes from the library. */
.classic .hd-site-header--chrome {
  --site-chrome-a: calc((var(--hd-opacity-chrome) + 1) / 2 * 100%);
  background: linear-gradient(color-mix(in srgb, #3A3A3A var(--site-chrome-a), transparent), color-mix(in srgb, #141414 var(--site-chrome-a), transparent)); }
@media (max-width: 599.98px) { .classic .hd-site-header__nav { background: linear-gradient(color-mix(in srgb, #3A3A3A 80%, transparent), color-mix(in srgb, #141414 80%, transparent)); } }
/* tablets: seven links and Try did not fit, Progress was cut off under the button */
@media (min-width: 600px) and (max-width: 959.98px) { .classic .hd-site-header__nav { gap: 0; } .classic .hd-site-header__link { padding-inline: 7px; } .classic .hd-site-header__brand { font-size: 0; gap: 0; } }
/* the hero runs up under the see-through header, so the top of the page is one dark surface */
@media (min-width: 600px) { .classic-hero { margin-top: calc(-1 * var(--site-header-h, 57px)); padding-top: var(--site-header-h, 57px); } }
.classic .hd-site-header--chrome .classic-mark--light, .classic .hd-site-header:not(.hd-site-header--chrome) .classic-mark--dark { display: none; }
/* Phones: the menu is the bottom toolbar and the hero has the logo, the name and Try, so no top bar at all.
   The header stays in the page for its bottom toolbar (a fixed child), with nothing of its own showing. */
@media (max-width: 599.98px) {
  /* no backdrop-filter: it makes the header the containing block of its fixed bottom bar, which then sat above the
     page (0 px high header) instead of at the bottom of the screen (design library 0.15.0) */
  .classic .hd-site-header { height: 0; border: 0; background: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
  .classic .hd-site-header__bar { height: 0; padding: 0; }
  .classic .hd-site-header__brand, .classic .hd-site-header__actions { display: none; }
}
.classic-hero { background: radial-gradient(900px 500px at 75% 20%, color-mix(in srgb, var(--hd-accent) 26%, transparent), transparent 70%), var(--hd-surface-home); color: var(--hd-c-fg); }
.classic-hero__in { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: center; padding-top: 28px; padding-bottom: 28px; }
@media (min-width: 900px) { .classic-hero__in { grid-template-columns: minmax(0, 720px) 340px; justify-content: center; gap: 56px; } }
.classic-hero__mark { margin: 0 0 4px; }
.classic-hero .hd-hero { background: transparent; padding: 12px 0 0; }
.classic-hero .hd-hero > * { max-width: none; }
.classic-hero .hd-hero { text-align: left; }
.classic-hero .hd-hero__inner { grid-template-columns: 1fr !important; padding-inline: 0 !important; padding-block: 16px 0 !important; }
.classic-hero .hd-hero__lead { max-width: 46em; }
.classic-hero__text { padding-left: 32px; }
.classic-hero__brand { display: flex; align-items: center; gap: 14px; font: 700 var(--hd-font-size-xsmall)/1 var(--hd-font-family-base); letter-spacing: .04em; text-transform: uppercase; color: var(--hd-accent); }
.classic-hero__phone .ph { text-align: left; }
.classic-hero__phone { display: flex; flex-direction: column; align-items: center; gap: 10px; scroll-margin-top: 80px; }
.classic-hero__phone > .x-fit { width: min(320px, 82vw); height: auto; aspect-ratio: 1 / 2; border-radius: 18px; background: #0e1418; box-shadow: 0 0 0 8px #151517, 0 0 0 9px #2a2a2d, 0 24px 60px rgba(0,0,0,.55); }
.classic-hero__cap { max-width: 320px; margin: 8px 0 0; text-align: center; font: 400 var(--hd-font-size-small)/1.4 var(--hd-font-family-base); color: var(--hd-c-fg-secondary); }
.classic-sec { padding: 28px 0; scroll-margin-top: 64px; }
.classic-sec--alt { background: color-mix(in srgb, var(--hd-c-fg) 4%, var(--hd-c-bg)); }
.classic-up { display: inline-flex; align-items: center; gap: 4px; margin: 0 0 14px; color: var(--hd-accent); text-decoration: none; font: 400 var(--hd-font-size-small)/1.2 var(--hd-font-family-base); }
.classic-up:hover { text-decoration: underline; }
.classic-sec .doc__in { padding-left: 0; padding-right: 0; }
</style>
