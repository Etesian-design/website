<script setup lang="ts">
/**
 * The website (/, on every screen; once called the classic site): a traditional scrolling page built from the design repo's web components (the "Web" story:
 * HdSiteHeader, HdHero, HdContainer, HdFooter), with the same content as the desktop windows and phone pages.
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
import XFit from '@etesian-design/shell/parts/XFit.vue';
import PhoneUI from '@/components/phone/PhoneUI.vue';
import EtesianMark from '@/components/common/EtesianMark.vue';
import { listed, doc, type DocId } from '../content/site';
import PageRenderer from '@/components/blocks/PageRenderer.vue';
import { provideNav, type Target } from '../lib/nav';

const $q = useQuasar();
const { isHydrated } = useHydration();
const router = useRouter();
const SECTIONS = listed('classic');
/** the hero copy is the overview page's hero block */
const hero = (doc('overview').blocks.find((b) => b.type === 'hero') ?? { title: 'Etesian' }) as { title: string; lead?: string; eyebrow?: string };
const links = SECTIONS.map((d) => ({ label: d.label, href: `#sec-${d.id}`, icon: d.icon }));
const footer = [
  { title: 'Etesian', links: SECTIONS.map((d) => ({ label: d.title, href: `#sec-${d.id}` })) },
  { title: 'Views', links: [{ label: 'Try the desktop', href: href('/desktop') }, { label: 'Try the phone', href: href('/phone') }] },
  { title: 'Source', links: [
    { label: 'Design language', href: 'https://language.etesian-design.com' },
    { label: 'Phone on GitHub', href: 'https://github.com/etesian-design/android_vendor_etesian' },
    { label: 'Plasma on GitHub', href: 'https://github.com/etesian-design/plasma' },
    { label: 'Design on GitHub', href: 'https://github.com/etesian-design/design' },
    { label: 'Website on GitHub', href: 'https://github.com/etesian-design/website' },
  ] },
];
/** the screen is only known in the browser: the generated page says "Try the desktop" until it has hydrated */
const osLabel = computed(() => (isHydrated.value && $q.screen.width < 820 ? 'Try the phone' : 'Try the desktop'));
usePageMeta('Etesian', 'Etesian, a calm, gesture-first interface: the phone, the apps, the widgets, the design language and Etesian for KDE Plasma.', '/');
function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function open(t: Target) { scrollTo(t === 'try-phone' ? 'sec-try' : `sec-${t as DocId}`); }
provideNav({ open, shell: 'classic' });
/** in-page anchors scroll smoothly instead of going through the router */
function onClick(e: MouseEvent) {
  const a = (e.target as HTMLElement).closest('a'); const h = a?.getAttribute('href');
  if (h?.startsWith('#sec-')) { e.preventDefault(); scrollTo(h.slice(1)); }
}
</script>
<template>
  <div class="classic hd-on-page" @click.capture="onClick">
    <HdSiteHeader brand="Etesian" tone="chrome" :brand-href="href('/')" :links="links">
      <!-- the bar is light until the design library's dark tone (0.3.1) arrives; then the pearl logo -->
      <template #logo><EtesianMark :size="28" on="light" class="classic-mark--light" /><EtesianMark :size="28" on="dark" class="classic-mark--dark" /></template>
      <template #actions><HdButton variant="accent" @click="router.push('/try')">{{ osLabel }}</HdButton></template>
    </HdSiteHeader>
    <main id="main">
      <section class="classic-hero hd-on-home">
        <HdContainer size="wide" class="classic-hero__in">
          <div class="classic-hero__text">
            <div class="classic-hero__brand"><EtesianMark :size="48" on="dark" /><span>{{ hero.eyebrow }}</span></div>
            <HdHero :title="hero.title" :lead="hero.lead">
              <template #actions>
                <HdButton variant="accent" @click="router.push('/try')">{{ osLabel }}</HdButton>
                <HdButton v-if="osLabel !== 'Try the phone'" icon="phone" @click="open('try-phone')">Try the phone</HdButton>
              </template>
            </HdHero>
          </div>
          <div id="sec-try" class="classic-hero__phone" aria-label="Interactive phone">
            <XFit :w="360" :h="720" fit="contain"><PhoneUI embedded :start-locked="true" @navigate="(h: string) => router.push(h)" /></XFit>
            <p class="classic-hero__cap">Interactive: swipe sideways to unlock, then tap an app. Swipe in from an edge to minimise it.</p>
          </div>
        </HdContainer>
      </section>
      <section v-for="(d, i) in SECTIONS" :id="`sec-${d.id}`" :key="d.id" class="classic-sec" :class="{ 'classic-sec--alt': i % 2 === 1 }">
        <HdContainer size="wide"><PageRenderer :page="d" /></HdContainer>
      </section>
    </main>
    <HdFooter :columns="footer" note="Etesian. An independent project, not affiliated with Nokia. The Nokia N9 (2011) is credited as its inspiration." />
  </div>
</template>
<style>
.classic { min-height: 100%; background: var(--hd-c-bg); color: var(--hd-c-fg); }
/* the header's logo matches its bar: deep blue on the light one, pearl on the dark (chrome) one */
.classic .hd-site-header--chrome .classic-mark--light, .classic .hd-site-header:not(.hd-site-header--chrome) .classic-mark--dark { display: none; }
/* Phones: the menu is the bottom toolbar and the hero has the logo, the name and Try, so no top bar at all.
   The header stays in the page for its bottom toolbar (a fixed child), with nothing of its own showing. */
@media (max-width: 599.98px) {
  .classic .hd-site-header { height: 0; border: 0; background: none; }
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
.classic-sec .doc__in { padding-left: 0; padding-right: 0; }
</style>
