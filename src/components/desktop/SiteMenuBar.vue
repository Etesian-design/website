<script setup lang="ts">
/**
 * The desktop's global menu bar: the design library's one menu bar (@etesian-design/shell XMenuBar), with the website's menus,
 * the Etesian mark and a "Back to the website" link. Left = the focused window's name and the menus; right = Events count,
 * status icons, then the clock (it opens Events too) at the far right.
 */
import { href } from '../../lib/base';
import XMenuBar from '@etesian-design/shell/desktop/XMenuBar.vue';
import type { ShellMenu } from '@etesian-design/shell';
import EtesianMark from '../common/EtesianMark.vue';
import { listed } from '../../content/site';
import { useClock } from '../../lib/clock';
defineProps<{ app: string; active?: 'events' | 'status' | null; count?: number }>();
const emit = defineEmits<{ events: []; status: []; select: [id: string] }>();
const { time, shortDate } = useClock();
const MENUS: ShellMenu[] = [
  { label: 'Go', items: [{ id: 'doc:overview', label: 'About Etesian', icon: 'star' }, { id: 'classic', label: 'Back to the website', icon: 'globe', divider: true }] },
  { label: 'Explore', items: listed('menu').filter((d) => d.id !== 'overview').map((d) => ({ id: `doc:${d.id}`, label: d.title, icon: d.icon })) },
  { label: 'View', items: [{ id: 'main', label: 'Overview', icon: 'grid', keys: 'Super' }, { id: 'windows', label: 'Windows', icon: 'window', keys: 'Super+Tab' }, { id: 'launcher', label: 'Search', icon: 'search', keys: 'Super+Space' }, { id: 'events', label: 'Events', icon: 'calendar', keys: 'Super+N' },
    { id: 'try-phone', label: 'Interactive phone', icon: 'phone', divider: true }, { id: 'phone-view', label: 'Phone layout', icon: 'phone' }] },
  { label: 'Window', items: [{ id: 'minimise', label: 'Minimise', icon: 'minimize' }, { id: 'maximise', label: 'Maximise', icon: 'maximize', keys: 'Super+Up' }, { id: 'snap-left', label: 'Snap left', keys: 'Super+Left' }, { id: 'snap-right', label: 'Snap right', keys: 'Super+Right' },
    { id: 'layouts', label: 'Snap layouts', icon: 'split', keys: 'Super+Z' }, { id: 'desktop', label: 'Show the desktop', keys: 'Super+D' }, { id: 'close', label: 'Close window', icon: 'close', divider: true }] },
];
</script>
<template>
  <XMenuBar class="site-mbar" :app="app" :menus="MENUS" :count="count ?? 3" :hints="false" :active="active ?? null" :date="shortDate" :time="time"
    @events="emit('events')" @status="emit('status')" @select="emit('select', $event)">
    <template #mark><EtesianMark :size="18" on="dark" /></template>
    <template #indicators><a class="site-mbar__link hd-sqm hd-focusable" :href="href('/')">Back to the website</a></template>
  </XMenuBar>
</template>
<style>
.site-mbar__link { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; color: inherit; text-decoration: none; font-size: var(--hd-font-size-small); box-shadow: inset 0 0 0 1px var(--hd-c-divider); }
.site-mbar__link:hover { background: var(--hd-c-pressed); }
</style>
