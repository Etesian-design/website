<script setup lang="ts">
/**
 * The desktop's global menu bar (design repo XMenuBar's markup and classes):
 * left = the focused window's name and the menus; right = Events count, status icons, then the clock at the far right.
 */
import { href } from '../../lib/base';
import { ref } from 'vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import HdCountBubble from '@etesian-design/vue/components/HdCountBubble.vue';
import XContextMenu from '@etesian-design/shell/parts/XContextMenu.vue';
import type { XMenuItem } from '@etesian-design/shell/parts/types';
import EtesianMark from '../common/EtesianMark.vue';
import { listed } from '../../content/site';
import { useClock } from '../../lib/clock';
defineProps<{ app: string; active?: 'events' | 'status' | null; count?: number }>();
const emit = defineEmits<{ events: []; status: []; select: [id: string] }>();
const { time, shortDate } = useClock();
const MENUS: Record<string, XMenuItem[]> = {
  Go: [{ id: 'doc:overview', label: 'About Etesian', icon: 'star' }, { id: 'doc:progress', label: 'Follow progress', icon: 'info' }, { id: 'classic', label: 'Back to the website', icon: 'globe', divider: true }],
  Explore: listed('menu').filter((d) => d.id !== 'overview').map((d) => ({ id: `doc:${d.id}`, label: d.title, icon: d.icon })),
  View: [{ id: 'main', label: 'Overview', icon: 'grid', keys: 'Super' }, { id: 'windows', label: 'Windows', icon: 'window', keys: 'Super+Tab' }, { id: 'launcher', label: 'Search', icon: 'search', keys: 'Super+Space' }, { id: 'events', label: 'Events', icon: 'calendar', keys: 'Super+N' },
    { id: 'try-phone', label: 'Interactive phone', icon: 'phone', divider: true }, { id: 'phone-view', label: 'Phone layout', icon: 'phone' }],
  Window: [{ id: 'minimise', label: 'Minimise', icon: 'minimize' }, { id: 'maximise', label: 'Maximise', icon: 'maximize', keys: 'Super+Up' }, { id: 'snap-left', label: 'Snap left', keys: 'Super+Left' }, { id: 'snap-right', label: 'Snap right', keys: 'Super+Right' },
    { id: 'layouts', label: 'Snap layouts', icon: 'split', keys: 'Super+Z' }, { id: 'desktop', label: 'Show the desktop', keys: 'Super+D' }, { id: 'close', label: 'Close window', icon: 'close', divider: true }],
};
const open = ref<string | null>(null);
function pick(id: string) { open.value = null; emit('select', id); }
</script>
<template>
  <header class="x-mbar hd-on-home site-mbar" role="menubar" :aria-label="`${app} menu bar`">
    <EtesianMark :size="18" on="dark" class="site-mbar__mark" />
    <span class="x-mbar__app">{{ app }}</span>
    <span v-for="(items, m) in MENUS" :key="m" class="x-mbar__m">
      <button type="button" role="menuitem" class="x-mbar__menu hd-focusable" :class="{ 'is-open': open === m }" :aria-expanded="open === m ? 'true' : 'false'" aria-haspopup="menu"
        @click="open = open === m ? null : m" @mouseenter="open && (open = m)">{{ m }}</button>
      <span v-if="open === m" class="x-mbar__drop"><XContextMenu :open="true" :items="items" :label="m" @select="pick" @update:open="open = null" /></span>
    </span>
    <span class="x-mbar__sp"></span>
    <span class="x-mbar__status" aria-label="Status">
      <a class="site-mbar__link hd-sqm hd-focusable" :href="href('/')">Back to the website</a>
      <button type="button" class="x-mbar__events hd-focusable" :class="{ 'is-active': active === 'events' }" :aria-label="`Events: ${count ?? 3} new`" @click="emit('events')"><HdCountBubble :value="count ?? 3" /></button>
      <button type="button" class="x-mbar__sicons hd-focusable" :class="{ 'is-active': active === 'status' }" aria-label="Status menu" :aria-expanded="active === 'status' ? 'true' : 'false'" @click="emit('status')">
        <HdIcon name="wifi" :size="15" /><HdIcon name="bluetooth" :size="15" /><span class="x-mbar__batt"><HdIcon name="battery" :size="17" />82%</span>
      </button>
      <span class="x-mbar__clock" :aria-label="`${shortDate}, ${time}`"><span>{{ shortDate }}</span><b>{{ time }}</b></span>
    </span>
  </header>
  <div v-if="open" class="site-mbar__scrim" @pointerdown="open = null"></div>
</template>
<style>
.site-mbar__mark { margin-right: 8px; }
.site-mbar__link { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; color: inherit; text-decoration: none; font-size: var(--hd-font-size-small); box-shadow: inset 0 0 0 1px var(--hd-c-divider); }
.site-mbar__link:hover { background: var(--hd-c-pressed); }
.site-mbar__scrim { position: fixed; inset: 0; z-index: 59; }
.site-mbar .x-mbar__drop { z-index: 61; }
</style>
