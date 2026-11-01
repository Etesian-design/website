<script setup lang="ts">
/**
 * The Etesian OS in the browser: the desktop on wide screens, the phone UI on phone-sized ones (or forced by route).
 * The screen size is only known in the browser, so the generated page (SSG) carries a plain summary of the site with
 * links, and the desktop or the phone takes over once the page has hydrated (as Quasar's SSG code caveats ask).
 */
import { computed } from 'vue';
import { useQuasar, useHydration } from 'quasar';
import { DOCS } from '@/content/site';
import { usePageMeta } from '@/lib/meta';
import { useRouter } from 'vue-router';
import WebDesktop from '@/components/desktop/WebDesktop.vue';
import PhoneUI from '@/components/phone/PhoneUI.vue';
import XFit from '@etesian/stories/explorations/parts/XFit.vue';
const props = defineProps<{ force?: 'desktop' | 'phone' }>();
const { isHydrated } = useHydration();
const DESC = 'Etesian brings the Nokia N9’s ideas back: a calm, gesture-first design language for an Android phone and the KDE Plasma desktop. Try it in your browser.';
usePageMeta(props.force === 'desktop' ? 'Etesian · Desktop' : props.force === 'phone' ? 'Etesian · Phone' : 'Etesian', DESC, props.force ? `/${props.force}` : '/');
const $q = useQuasar();
const router = useRouter();
/** phone-sized: narrow, or a short landscape phone */
const small = computed(() => $q.screen.width < 820 || $q.screen.height < 540);
const mode = computed(() => props.force ?? (small.value ? 'phone' : 'desktop'));
function go(href: string) { void router.push(href); }
</script>
<template>
  <main v-if="!isHydrated" class="site-pre hd-on-home">
    <h1>Etesian</h1>
    <p>{{ DESC }}</p>
    <ul><li v-for="d in DOCS" :key="d.id"><a :href="`/classic#sec-${d.id}`">{{ d.title }}</a>: {{ d.summary }}</li></ul>
    <p><a href="/classic">The classic site</a></p>
  </main>
  <WebDesktop v-else-if="mode === 'desktop'" />
  <div v-else-if="small" class="site-phone"><PhoneUI @navigate="go" /></div>
  <div v-else class="site-phonestage hd-on-home">
    <div class="site-phonestage__dev"><XFit :w="360" :h="720" fit="contain"><PhoneUI embedded @navigate="go" /></XFit></div>
    <nav class="site-phonestage__nav" aria-label="Other views"><router-link to="/desktop">Desktop view</router-link><router-link to="/classic">Classic site</router-link></nav>
  </div>
</template>
<style>
.site-pre { position: fixed; inset: 0; padding: 48px 24px; background: #000; color: var(--hd-c-fg-secondary); overflow: hidden; font: 400 var(--hd-font-size-small)/1.5 var(--hd-font-family-base); }
.site-pre h1 { margin: 0 0 8px; color: var(--hd-c-fg); font: var(--hd-font-weight-light) var(--hd-font-size-xlarge)/1 var(--hd-font-family-light); }
.site-pre a { color: var(--hd-c-fg); }
.site-phone { position: fixed; inset: 0; height: 100dvh; background: #000; }
.site-phonestage { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 24px; background: radial-gradient(900px 600px at 60% 30%, color-mix(in srgb, var(--hd-accent) 20%, transparent), transparent 70%), #000; color: var(--hd-c-fg); }
.site-phonestage__dev { width: min(100%, calc((100dvh - 110px) / 2)); aspect-ratio: 1 / 2; border-radius: 22px; overflow: hidden; box-shadow: 0 0 0 10px #151517, 0 0 0 11px #2a2a2d, 0 30px 80px rgba(0,0,0,.6); }
.site-phonestage__dev .x-fit { height: 100%; }
.site-phonestage__nav { display: flex; gap: 18px; font: 400 var(--hd-font-size-small)/1 var(--hd-font-family-base); }
.site-phonestage__nav a { color: var(--hd-c-fg-secondary); text-decoration: none; }
.site-phonestage__nav a:hover { color: var(--hd-c-fg); }
</style>
