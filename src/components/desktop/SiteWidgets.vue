<script setup lang="ts">
/**
 * The desktop's Belle widgets, on the wallpaper under the windows (as on Plasma and the phone's home). Edit mode (right-click
 * the desktop → Edit desktop, or Add widgets): the grid shows, each widget gets the launcher's edit chrome (BelleWidget
 * `editing`: outline, red ✕ to remove), widgets drag to move, and the Add widgets sheet (the design's XWidgets sheet) adds
 * them. Kept in this browser only (localStorage), so a visitor's own arrangement survives a reload.
 */
import { ref, watch, onMounted } from 'vue';
import BelleWidget, { type BelleKind } from '@etesian/stories/belle/BelleWidget.vue';
import XMailWidget from '@etesian/stories/explorations/desktop2/XMailWidget.vue';
import XChatsWidget from '@etesian/stories/explorations/desktop2/XChatsWidget.vue';
import '@etesian/stories/explorations/desktop2/XWidgets.vue';
const props = defineProps<{ left: number; top: number }>();
const editing = defineModel<boolean>('editing', { default: false });

/** a Belle widget, or the desktop's own Mail and Chats panels (XMailWidget, XChatsWidget) */
type Kind = BelleKind | 'x-mail' | 'x-chats';
interface Placed { id: number; kind: Kind; x: number; y: number }
/** the design's set and places (XWidgets): flip clock and agenda, Mail and Chats, the feed and the analog clock */
const DEFAULT: Placed[] = [{ id: 1, kind: 'flipclock', x: 60, y: 40 }, { id: 2, kind: 'agenda', x: 60, y: 250 }, { id: 3, kind: 'x-mail', x: 470, y: 40 },
  { id: 4, kind: 'x-chats', x: 470, y: 340 }, { id: 5, kind: 'rss', x: 880, y: 40 }, { id: 6, kind: 'analog', x: 880, y: 340 }];
/** the Add widgets sheet: groups as in the phone's widget picker; every entry is a real BelleWidget */
const CATALOGUE: { group: string; items: [Kind, string][] }[] = [
  { group: 'Clocks', items: [['analog', 'Analog'], ['bigclock', 'Big clock'], ['flipclock', 'Flip clock'], ['wordclock', 'Word clock'], ['lcdclock', 'LCD clock']] },
  { group: 'Mail', items: [['x-mail', 'Unread mail']] },
  { group: 'Calendar', items: [['agenda', 'Agenda'], ['today', 'Today']] },
  { group: 'Chats', items: [['x-chats', 'Latest chats']] },
  { group: 'Feeds', items: [['rss', 'RSS feed']] },
];
const KEY = 'etesian-desktop-widgets-v2'; // v2: the design's default set
const placed = ref<Placed[]>(DEFAULT.map((w) => ({ ...w })));
onMounted(() => { try { const s = localStorage.getItem(KEY); if (s) placed.value = JSON.parse(s) as Placed[]; } catch { /* private window: the default set */ } });
watch(placed, (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* not kept */ } }, { deep: true });

function add(kind: Kind) {
  const n = placed.value.length;
  placed.value.push({ id: Math.max(0, ...placed.value.map((w) => w.id)) + 1, kind, x: 380 + (n % 3) * 30, y: 20 + (n % 5) * 40 });
}
function remove(id: number) { placed.value = placed.value.filter((w) => w.id !== id); }
function reset() { placed.value = DEFAULT.map((w) => ({ ...w })); }
defineExpose({ add, reset });

/* drag to move, in edit mode only; a tap on the red ✕ removes */
let drag: { id: number; dx: number; dy: number; pid: number } | null = null;
function down(w: Placed, e: PointerEvent) {
  if (!editing.value || e.button > 0) return;
  if ((e.target as HTMLElement).closest('.bw-close')) { remove(w.id); return; }
  drag = { id: w.id, dx: e.clientX - w.x, dy: e.clientY - w.y, pid: e.pointerId };
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}
function move(e: PointerEvent) {
  if (!drag || drag.pid !== e.pointerId) return;
  const w = placed.value.find((p) => p.id === drag!.id); if (!w) return;
  w.x = Math.max(-props.left + 8, Math.round((e.clientX - drag.dx) / 10) * 10); w.y = Math.max(-props.top + 8, Math.round((e.clientY - drag.dy) / 10) * 10);
}
function up() { drag = null; }
</script>
<template>
  <div class="site-wg" :class="{ 'x-wg--edit': editing }" aria-label="Desktop widgets">
    <div v-for="w in placed" :key="w.id" class="site-wg__at" :class="{ 'is-edit': editing }" :style="{ left: `${left + w.x}px`, top: `${top + w.y}px` }"
      @pointerdown="down(w, $event)" @pointermove="move" @pointerup="up" @pointercancel="up">
      <XMailWidget v-if="w.kind === 'x-mail'" :editing="editing" />
      <XChatsWidget v-else-if="w.kind === 'x-chats'" :editing="editing" />
      <BelleWidget v-else :kind="w.kind" :editing="editing" />
    </div>
    <aside v-if="editing" class="x-wg__sheet hd-on-overlay site-wg__sheet" aria-label="Add widgets">
      <h3>Add widgets</h3>
      <section v-for="g in CATALOGUE" :key="g.group">
        <h4>{{ g.group }}</h4>
        <button v-for="[k, label] in g.items" :key="k" type="button" class="x-wg__item hd-focusable" @click="add(k)">{{ label }}<span aria-hidden="true">+</span></button>
      </section>
      <button type="button" class="x-wg__item hd-focusable site-wg__reset" @click="reset">Restore the default widgets</button>
      <button type="button" class="x-wg__done hd-focusable" @click="editing = false">Done</button>
    </aside>
  </div>
</template>
<style>
.site-wg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.site-wg.x-wg--edit { z-index: 35; pointer-events: auto; background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px); background-size: 90px 90px; }
.site-wg__at { position: absolute; pointer-events: auto; }
.site-wg__at.is-edit { cursor: grab; touch-action: none; }
.site-wg__at.is-edit:active { cursor: grabbing; }
.site-wg__at .bw-close { cursor: pointer; }
.site-wg__sheet { z-index: 30; right: 120px; }
.site-wg__reset { margin-top: 14px; color: var(--hd-c-fg-secondary); font-size: 13px; }
</style>
