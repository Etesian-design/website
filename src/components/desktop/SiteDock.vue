<script setup lang="ts">
/**
 * The Desktop v2 light floating dock (design repo XDock's markup and classes):
 * Overview button | the open windows | recycle bin. Pages and apps are opened from the desktop icons and the Overview,
 * so the dock only carries what is open, each with the running dot. Hovering one shows its live window (XDock's previews:
 * the window's own shape, its title under it). Its right-click menu (WebDesktop) opens the dock settings (XDockSettings): edge, icon size and
 * visibility; auto-hidden, it slides off its edge and comes back when the pointer reaches that edge.
 */
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import HdTooltip from '@etesian-design/vue/components/HdTooltip.vue';
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { GAP, dockThickness, type DockPos } from '@etesian-design/shell/desktop/geometry';

export interface DockItem { key: string; title: string; icon: string; color: string; tone?: 'light' | 'dark'; w: number; h: number }
const props = withDefaults(defineProps<{ items: DockItem[]; active?: string; launcherActive?: boolean; position?: DockPos; size?: number; autoHide?: boolean; panel?: boolean; editing?: boolean; launcher?: boolean; trash?: boolean; previews?: boolean }>(),
  { position: 'left', size: 44, launcher: true, trash: true, previews: true });
/** editing (Edit dock, docs/21-desktop.md): dashed outline, × on each item (closes that window; hides the launcher or the bin),
 * a handle that drags the dock to the nearest screen edge, and the settings gear */
const emit = defineEmits<{ launcher: []; item: [key: string]; settings: []; remove: [key: string]; move: [pos: DockPos] }>();
const vertical = computed(() => props.position === 'left' || props.position === 'right');
const revealed = ref(false);
/** revealed, it stays out until the pointer moves further from its edge than the dock reaches (not on leaving the dock:
 * sliding in, the dock passes under the pointer) */
const nav = ref<HTMLElement>();
function away(e: PointerEvent) {
  const area = nav.value?.offsetParent?.getBoundingClientRect(); if (!area) return;
  const d = { left: e.clientX - area.left, right: area.right - e.clientX, top: e.clientY - area.top, bottom: area.bottom - e.clientY }[props.position];
  if (d > dockThickness(props.size) + 2 * GAP) revealed.value = false;
}
watch(revealed, (on) => (on ? window.addEventListener('pointermove', away) : window.removeEventListener('pointermove', away)));
onBeforeUnmount(() => { window.removeEventListener('pointermove', away); window.clearTimeout(leaveT); });
const hidden = computed(() => props.autoHide && !props.editing && !revealed.value && !hover.value);
const style = computed(() => {
  const s: Record<string, string> = { '--x-dock-i': `${props.size}px`, [props.position]: `${GAP}px` };
  if (props.panel) Object.assign(s, vertical.value ? { top: `${GAP}px`, bottom: `${GAP}px` } : { left: `${GAP}px`, right: `${GAP}px` });
  return s;
});
const tip = computed(() => (props.position === 'top' ? 'bottom' : 'top') as 'top' | 'bottom');
const hover = ref<string | null>(null);
/** the preview is drawn over the desktop area, not inside the dock (its blur and offset made the scaled live window
 * repaint badly), beside the hovered icon; a short delay on leave keeps it through the gaps between icons */
const peekAt = ref<Record<string, string>>({});
let leaveT = 0;
function enter(key: string, e: MouseEvent) {
  window.clearTimeout(leaveT);
  const slot = (e.currentTarget as HTMLElement).getBoundingClientRect(), area = nav.value?.offsetParent?.getBoundingClientRect();
  if (!area) return;
  const off = dockThickness(props.size) + GAP + 16, cx = slot.left + slot.width / 2 - area.left, cy = slot.top + slot.height / 2 - area.top;
  const auto = { left: 'auto', right: 'auto', top: 'auto', bottom: 'auto' };
  peekAt.value = { ...auto, ...(props.position === 'left' ? { left: `${off}px`, top: `${cy}px`, transform: 'translateY(-50%)' }
    : props.position === 'right' ? { right: `${off}px`, top: `${cy}px`, transform: 'translateY(-50%)' }
    : props.position === 'top' ? { top: `${off}px`, left: `${cx}px`, transform: 'translateX(-50%)' }
    : { bottom: `${off}px`, left: `${cx}px`, transform: 'translateX(-50%)' }) };
  hover.value = key;
}
function leave() { window.clearTimeout(leaveT); leaveT = window.setTimeout(() => (hover.value = null), 120); }
/** the move handle: drag, and on release the dock goes to the screen edge nearest the pointer */
const moving = ref(false);
function moveDown(e: PointerEvent) { moving.value = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }
function moveMove() { /* the dock jumps on release; the cursor shows the grab */ }
function moveUp(e: PointerEvent) {
  if (!moving.value) return; moving.value = false;
  const a = nav.value?.offsetParent?.getBoundingClientRect(); if (!a) return;
  const d = { left: e.clientX - a.left, right: a.right - e.clientX, top: e.clientY - a.top, bottom: a.bottom - e.clientY };
  emit('move', (Object.keys(d) as DockPos[]).reduce((m, k) => (d[k] < d[m] ? k : m)));
}
const hovered = computed(() => props.items.find((i) => i.key === hover.value));
/** the preview fits the window into 280 px on its longer side */
const fit = (i: DockItem) => { const s = 280 / Math.max(i.w, i.h); return { w: Math.round(i.w * s), h: Math.round(i.h * s), s }; };
</script>
<template>
  <span v-if="hidden" class="x-dock-edge site-dock-edge" :class="`x-dock-edge--${position}`" aria-hidden="true" @mouseenter="revealed = true"></span>
  <nav ref="nav" class="x-dock hd-on-home" :class="[`x-dock--${position}`, { 'is-vertical': vertical, 'is-panel': panel, 'is-hidden': hidden, 'is-autohide': autoHide, 'is-editing': editing }]" :style="style" aria-label="Dock">
    <span v-if="launcher" class="x-dock__slot">
      <HdTooltip text="Overview" :placement="tip"><button type="button" class="x-dock__launcher hd-sq hd-focusable" :class="{ 'is-active': launcherActive }" aria-label="Overview" @click="emit('launcher')"><HdIcon name="grid" :size="Math.round(size / 2)" /></button></HdTooltip>
      <button v-if="editing" type="button" class="x-dock__rm hd-sq site-dock__rm" aria-label="Remove the launcher button" @click="emit('remove', 'launcher')">×</button>
    </span>
    <span v-if="items.length && launcher" class="x-dock__div" aria-hidden="true"></span>
    <span v-for="i in items" :key="i.key" class="x-dock__slot is-running" :class="{ 'is-active': active === i.key }" @mouseenter="enter(i.key, $event)" @mouseleave="leave">
      <button type="button" class="x-dock__item hd-sq hd-focusable" :aria-label="i.title" @click="emit('item', i.key)">
        <HdSquircle :size="size" :color="i.color" lighting="lit" :tone="i.tone"><HdIcon :name="i.icon" :size="Math.round(size / 2)" :lit="i.tone === 'light' ? 'dark' : true" /></HdSquircle></button>
      <span class="x-dock__run" aria-hidden="true"></span>
      <button v-if="editing" type="button" class="x-dock__rm hd-sq site-dock__rm" :aria-label="`Close ${i.title}`" @click="emit('remove', i.key)">×</button>
    </span>
    <span v-if="trash" class="x-dock__div" aria-hidden="true"></span>
    <span v-if="trash" class="x-dock__slot"><HdTooltip text="Recycle bin" :placement="tip"><button type="button" class="x-dock__applet hd-sq hd-focusable" aria-label="Recycle bin"><HdIcon name="delete" :size="Math.round(size / 2)" /></button></HdTooltip><button v-if="editing" type="button" class="x-dock__rm hd-sq site-dock__rm" aria-label="Remove the recycle bin" @click="emit('remove', 'trash')">×</button></span>
    <template v-if="editing">
      <span class="x-dock__move" title="Drag to any screen edge" role="button" aria-label="Move the dock: drag to any screen edge" @pointerdown="moveDown" @pointermove="moveMove" @pointerup="moveUp" @pointercancel="moveUp"><i></i><i></i><i></i></span>
      <button type="button" class="x-dock__gear hd-sq hd-focusable" aria-label="Dock settings" @click="emit('settings')"><HdIcon name="settings" :size="16" /></button>
    </template>
  </nav>
  <div v-if="hovered && previews && !editing" class="x-dock__peek site-dock-peek hd-on-overlay" role="tooltip" :style="peekAt">
    <div class="x-dock__peekwin" :style="{ width: `${fit(hovered).w}px`, height: `${fit(hovered).h}px` }">
      <div class="site-peek" inert :style="{ width: `${hovered.w}px`, height: `${hovered.h}px`, transform: `scale(${fit(hovered).s})` }"><slot name="preview" :item="hovered" /></div>
    </div>
    <b>{{ hovered.title }}</b>
  </div>
</template>
<style>
.site-dock-edge { pointer-events: auto; width: 10px; } .site-dock-edge.x-dock-edge--bottom, .site-dock-edge.x-dock-edge--top { width: auto; height: 10px; }
.x-dock__peek.site-dock-peek { z-index: 41; pointer-events: none; }
/* no backdrop blur: on the GPU it drew bits of the windows and other icons inside the dock's squircles (as on the lock cards) */
.x-dock.hd-on-home, .x-dock__peek.site-dock-peek { -webkit-backdrop-filter: none; backdrop-filter: none; }
.site-dock__rm { padding: 0; border: 0; cursor: pointer; font: 700 13px/1 var(--hd-font-family-base); }
.x-dock__move { touch-action: none; }
.site-peek { display: flex; flex-direction: column; transform-origin: 0 0; pointer-events: none; }
</style>
