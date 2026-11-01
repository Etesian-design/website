<script setup lang="ts">
/**
 * The Etesian desktop in the browser, following the approved Desktop v2 direction from the design repo:
 * a global menu bar (menus left, Events, status and clock right), a light floating dock on the left (XDock),
 * overlapping windows with the actions in their decorations (XWin / DocWin), drag to the left or right edge to snap, or to the
 * top edge for the snap layouts (XLayoutPicker, also Super+Z), Super+arrows to snap and maximise, Super+D for the desktop,
 * (XZones), top edge or double-click to maximise, the Overview as the main menu (SiteOverview: the dock button or Super), the windows
 * switcher (Super+Tab), the compact search (XLauncher, Super+Space),
 * the phone's Events panel (XEventsPanel) and the status menu (XStatusPanel).
 */
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import HdAppIcon from '@etesian-design/vue/components/HdAppIcon.vue';
import XWin from '@etesian-design/shell/desktop/XWin.vue';
import XZones from '@etesian-design/shell/desktop/XZones.vue';
import XDockSettings from '@etesian-design/shell/desktop/XDockSettings.vue';
import XLayoutPicker from '@etesian-design/shell/desktop/XLayoutPicker.vue';
import SiteWidgets from './SiteWidgets.vue';
import XContextMenu from '@etesian-design/shell/parts/XContextMenu.vue';
import XKey from '@etesian-design/shell/parts/XKey.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import HdInfoBanner from '@etesian-design/vue/components/HdInfoBanner.vue';
import type { XMenuItem } from '@etesian-design/shell/parts/types';
import XLauncher from '@etesian-design/shell/desktop/XLauncher.vue';
import SiteEventsPanel from './SiteEventsPanel.vue';
import XStatusPanel from '@etesian-design/shell/desktop/XStatusPanel.vue';
import XFit from '@etesian-design/shell/parts/XFit.vue';
import { chromeOf } from '@etesian-design/shell/desktop/chrome';
import { app as mockApp } from '@etesian-design/shell/parts/data';
import { zoneRects, dockThickness, GAP, LAYOUTS, type Rect, type ZoomLevel, type LayoutId, type DockPos } from '@etesian-design/shell/desktop/geometry';
import DocWin from './DocWin.vue';
import SiteMenuBar from './SiteMenuBar.vue';
import SiteWindows, { type OverviewWin } from './SiteWindows.vue';
import PhoneUI from '../phone/PhoneUI.vue';
import { listed, doc, type DocId } from '../../content/site';
import PageRenderer from '../blocks/PageRenderer.vue';
import SiteDock, { type DockItem } from './SiteDock.vue';
import SiteOverview from './SiteOverview.vue';
import WinPreview from './WinPreview.vue';
import { provideNav, provideInDesktop, type Target } from '../../lib/nav';

const router = useRouter();
const MOCKS = ['Mail', 'Messages', 'Calendar', 'Music', 'Gallery', 'Settings'];
const PHONE = { title: 'Etesian phone', icon: 'phone', color: '#62B700' };

/* ---------- geometry ---------- */
const areaEl = ref<HTMLElement>();
const size = reactive({ w: 1440, h: 870 });
/** the dock's settings (right-click it): edge, icon size, visibility; an auto-hidden dock takes no room */
const dockSet = reactive({ pos: 'left' as DockPos, panel: false, launcher: true, trash: true, previews: true, size: 44, vis: 'always' as 'always' | 'autohide' | 'dodge' });
const dockOpen = ref(false);
const ins = computed(() => {
  const t = dockSet.vis === 'always' ? dockThickness(dockSet.size) + GAP : 0;
  return { l: dockSet.pos === 'left' ? t : 0, r: dockSet.pos === 'right' ? t : 0, t: dockSet.pos === 'top' ? t : 0, b: dockSet.pos === 'bottom' ? t : 0 };
});
const ICONS_W = 104; // desktop icon column on the right
/** the free area beside the dock, and its left (L) and right (R) edges */
const work = computed<Rect>(() => ({ x: ins.value.l, y: ins.value.t, w: size.w - ins.value.l - ins.value.r, h: size.h - ins.value.t - ins.value.b }));
const L = computed(() => work.value.x), R = computed(() => work.value.x + work.value.w);
const maxRect = computed<Rect>(() => ({ x: work.value.x + GAP, y: work.value.y + GAP, w: work.value.w - 2 * GAP, h: work.value.h - 2 * GAP }));

/* ---------- windows ---------- */
type Kind = 'doc' | 'app' | 'phone';
/** a zone of a snap layout, maximised, or floating */
type Snap = { layout: LayoutId; zone: number } | 'max' | null;
const LAYOUT_IDS = Object.keys(LAYOUTS) as LayoutId[];
interface Win { key: string; kind: Kind; ref: string; x: number; y: number; w: number; h: number; z: number; min: boolean; snap: Snap }
const wins = ref<Win[]>([]);
const focused = ref<string | null>(null);
let zTop = 10;
/** only x, y, w, h: it is spread onto window components with v-bind */
const rectOf = (w: Win): Rect => (w.snap === 'max' ? maxRect.value : w.snap ? zoneRects(w.snap.layout, work.value)[w.snap.zone]! : { x: w.x, y: w.y, w: w.w, h: w.h });
const visible = computed(() => wins.value.filter((w) => !w.min));
const focusedWin = computed(() => wins.value.find((w) => w.key === focused.value && !w.min));
function focus(key: string) { const w = wins.value.find((x) => x.key === key); if (!w) return; w.z = ++zTop; w.min = false; focused.value = key; }
function phoneSize() {
  const h = Math.min(size.h - 2 * GAP - 16, 820), bodyH = h - 44, s = bodyH / 720;
  return { w: Math.round(360 * s) + 2, h };
}
function defaultRect(kind: Kind): Rect {
  const n = wins.value.filter((w) => !w.min).length, off = (n % 6) * 28;
  if (kind === 'phone') { const p = phoneSize(); return { x: Math.max(L.value + GAP, R.value - ICONS_W - p.w - 16 - off), y: work.value.y + GAP + 8, ...p }; }
  const w = Math.min(kind === 'app' ? 1080 : 860, R.value - L.value - ICONS_W - 48), h = Math.min(kind === 'app' ? 720 : 820, work.value.h - 2 * GAP - 24);
  return { x: L.value + 24 + off, y: work.value.y + GAP + 12 + off, w, h };
}
function openWin(kind: Kind, ref: string, rect?: Partial<Rect>) {
  const key = `${kind}:${ref}`;
  const existing = wins.value.find((w) => w.key === key);
  if (existing) { focus(key); return; }
  wins.value.push({ key, kind, ref, ...defaultRect(kind), ...rect, z: ++zTop, min: false, snap: null });
  focused.value = key;
}
function closeWin(key: string) { wins.value = wins.value.filter((w) => w.key !== key); if (focused.value === key) focusTopmost(); }
function minimiseWin(key: string) { const w = wins.value.find((x) => x.key === key); if (w) { w.min = true; } if (focused.value === key) focusTopmost(); }
function toggleMax(key: string) { const w = wins.value.find((x) => x.key === key); if (w) { w.snap = w.snap === 'max' ? null : 'max'; focus(key); } }
function focusTopmost() { const top = [...visible.value].sort((a, b) => b.z - a.z)[0]; focused.value = top?.key ?? null; }
function openTarget(t: Target) { if (t === 'try-phone') openWin('phone', 'phone'); else openWin('doc', t); closeOverlays(); }
provideNav({ open: openTarget, shell: 'desktop' });
provideInDesktop();

const winTitle = (w: { kind: Kind; ref: string }) => (w.kind === 'doc' ? doc(w.ref as DocId).title : w.kind === 'phone' ? PHONE.title : w.ref);
const barApp = computed(() => (main.value ? 'Overview' : overview.value ? 'Windows' : launcher.value ? 'Search' : focusedWin.value ? winTitle(focusedWin.value) : 'Etesian'));

/* ---------- drag to move, snap at the edges ---------- */
/** hot: what a release does now (a half at the side edges, a picker zone or maximise at the top edge) */
const drag = ref<{ key: string; dx: number; dy: number; id: number; hot: Snap; moved: boolean; sx: number; sy: number; top: boolean } | null>(null);
function areaPoint(e: PointerEvent) { const r = areaEl.value!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function onAreaDown(e: PointerEvent) {
  const t = e.target as HTMLElement;
  const winEl = t.closest<HTMLElement>('[data-win]');
  if (!winEl) return;
  const key = winEl.dataset.win!;
  if (focused.value !== key || wins.value.find((w) => w.key === key)!.z !== zTop) focus(key);
  if (e.button !== 0 || !t.closest('.x-win__bar') || t.closest('button, a, input, [role=textbox]')) return;
  const w = wins.value.find((x) => x.key === key)!;
  const p = areaPoint(e), r = rectOf(w);
  noSelect(e);
  drag.value = { key, dx: p.x - r.x, dy: p.y - r.y, id: e.pointerId, hot: null, moved: false, sx: p.x, sy: p.y, top: false };
  areaEl.value!.setPointerCapture(e.pointerId);
}
function onAreaMove(e: PointerEvent) {
  const d = drag.value; if (!d || d.id !== e.pointerId) return;
  const p = areaPoint(e);
  if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) < 4) return;
  const w = wins.value.find((x) => x.key === d.key)!;
  if (!d.moved) {
    d.moved = true;
    if (w.snap !== null) { // unsnap: keep the pointer at the same relative spot of the restored window
      const r = rectOf(w), fx = (p.x - r.x) / r.w; w.snap = null;
      d.dx = Math.min(w.w - 40, Math.max(40, fx * w.w)); d.dy = Math.min(22, p.y - r.y);
    }
  }
  w.x = Math.round(Math.min(size.w - 80, Math.max(L.value - w.w + 120, p.x - d.dx)));
  w.y = Math.round(Math.min(size.h - 44, Math.max(0, p.y - d.dy)));
  // the top edge drops the snap layouts; the pointer stays captured, so the zone under it is found by position
  if (p.y < 6) d.top = true; else if (p.y > 200) d.top = false;
  if (d.top) {
    d.hot = zoneAt(e.clientX, e.clientY) ?? (p.y < 6 ? 'max' : null);
  } else d.hot = p.x < L.value + 16 ? { layout: 'halves', zone: 0 } : p.x > R.value - 16 ? { layout: 'halves', zone: 1 } : null;
}
function onAreaUp(e: PointerEvent) {
  const d = drag.value; if (!d || d.id !== e.pointerId) return;
  if (d.moved && d.hot !== null) { const w = wins.value.find((x) => x.key === d.key)!; w.snap = d.hot; }
  picker.value = false;
  drag.value = null; grabbing.value = false;
}
function onAreaDbl(e: MouseEvent) {
  const t = e.target as HTMLElement;
  if (!t.closest('.x-win__bar') || t.closest('button, a, input')) return;
  const k = t.closest<HTMLElement>('[data-win]')?.dataset.win; if (k) toggleMax(k);
}
const dragWin = computed(() => (drag.value?.moved ? wins.value.find((w) => w.key === drag.value!.key) : undefined));
const dragZone = computed(() => { const h = drag.value?.hot; return h && h !== 'max' ? h : null; });

/* ---------- snap layouts (Super+Z or the top edge): a layout, then a zone ---------- */
/** the picker zone under a point: XLayoutPicker labels each zone "<layout label>, zone <n>" */
function zoneAt(x: number, y: number): Snap {
  const m = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('.x-lpick__z')?.getAttribute('aria-label')?.match(/^(.*), zone (\d+)$/);
  const id = m && LAYOUT_IDS.find((l) => LAYOUTS[l].label === m[1]);
  return id ? { layout: id, zone: Number(m[2]) - 1 } : null;
}
const picker = ref(false);
let pickedLayout: LayoutId | null = null;
function pickLayout(l: LayoutId, z: number) { picker.value = false; pickedLayout = null; const w = focusedWin.value; if (w) w.snap = { layout: l, zone: z }; }
/** Super+D: minimise every window; again brings them back */
let shown: string[] = [];
function showDesktop() {
  const up = wins.value.filter((w) => !w.min);
  if (up.length) { shown = up.map((w) => w.key); up.forEach((w) => (w.min = true)); focused.value = null; }
  else { shown.forEach((k) => { const w = wins.value.find((x) => x.key === k); if (w) w.min = false; }); shown = []; focusTopmost(); }
}

/* ---------- overlays ---------- */
/** main: the Overview (Super, the dock button); overview: the windows switcher (Super+Tab); launcher: the compact search (Super+Space) */
const main = ref(false), launcher = ref(false), events = ref(false), status = ref(false), overview = ref(false);
const query = ref('');
const level = ref<ZoomLevel>(3), sel = ref(0);
function closeOverlays() { main.value = launcher.value = events.value = status.value = overview.value = false; query.value = ''; }
function toggle(which: 'main' | 'launcher' | 'events' | 'status' | 'overview') {
  const was = { main, launcher, events, status, overview }[which].value; closeOverlays(); ({ main, launcher, events, status, overview })[which].value = !was;
  if ((which === 'overview' || which === 'main') && !was) sel.value = Math.max(0, overviewWins.value.findIndex((w) => w.key === focused.value));
  // Super+Tab opens the carousel (docs/21-desktop.md): one large card, the neighbours peeking in; the wheel zooms out from there
  if (which === 'overview' && !was) level.value = 1;
}
/** launcher and dock: the design repo's mock apps open as windows; the rest of the phone's apps open the interactive phone */
function openApp(name: string) {
  closeOverlays();
  if (MOCKS.includes(name)) openWin('app', name);
  else if (name === 'Phone') openWin('phone', 'phone');
  else openWin('doc', 'apps');
}
const overviewWins = computed<OverviewWin[]>(() => [...wins.value].sort((a, b) => b.z - a.z).map((w) => {
  const r = rectOf(w);
  if (w.kind === 'app') { const a = mockApp(w.ref); return { key: w.key, title: w.ref, sub: chromeOf(w.ref).title, icon: a.icon, color: a.color, w: r.w, h: r.h }; }
  if (w.kind === 'phone') return { key: w.key, title: PHONE.title, sub: 'Interactive', icon: PHONE.icon, color: PHONE.color, w: r.w, h: r.h };
  const d = doc(w.ref as DocId); return { key: w.key, title: d.title, sub: w.min ? 'Minimised' : d.summary, icon: d.icon, color: d.color, w: r.w, h: r.h };
}));
function onMenu(id: string) {
  if (id.startsWith('doc:')) openWin('doc', id.slice(4));
  else if (id === 'classic') router.push('/');
  else if (id === 'phone-view') router.push('/phone');
  else if (id === 'try-phone') openWin('phone', 'phone');
  else if (id === 'windows') toggle('overview');
  else if (id === 'main') toggle('main');
  else if (id === 'desktop') showDesktop();
  else if (id === 'layouts') picker.value = true;
  else if (id === 'launcher') toggle('launcher');
  else if (id === 'events') toggle('events');
  else if (focused.value) {
    const k = focused.value, w = wins.value.find((x) => x.key === k)!;
    if (id === 'minimise') minimiseWin(k); else if (id === 'maximise') toggleMax(k); else if (id === 'close') closeWin(k);
    else if (id === 'snap-left') w.snap = { layout: 'halves', zone: 0 }; else if (id === 'snap-right') w.snap = { layout: 'halves', zone: 1 };
  }
}

/* ---------- desktop icons, widgets and dock ---------- */
const widgetsOn = ref(false);
/** the dock settings' Widgets switches: launcher, previews and bin are real; clock and battery are not in this dock */
function onDockWidget(id: string, on: boolean) { if (id === 'launcher' || id === 'trash' || id === 'previews') dockSet[id] = on; }
const editWidgets = ref(false);

/* ---------- right-click menus ---------- */
const ctx = ref<{ x: number; y: number; label: string; items: XMenuItem[]; act: (id: string) => void } | null>(null);
/** the first visit shows where the right-click menus are (once per browser) */
const tip = ref(false);
function onContext(e: MouseEvent) {
  const t = e.target as HTMLElement;
  // inside a window's content and in the menus themselves the browser keeps its own menu (copy, open link …)
  if (t.closest('.x-cmenu, .x-dset, .site-wg__sheet') || (t.closest('[data-win]') && !t.closest('.x-win__bar'))) return;
  e.preventDefault();
  const a = areaEl.value!.getBoundingClientRect();
  const at = (items: XMenuItem[], label: string, act: (id: string) => void) => {
    ctx.value = { x: Math.min(e.clientX - a.left, size.w - 260), y: Math.min(e.clientY - a.top, size.h - 40 - items.length * 34), label, items, act };
  };
  const bar = t.closest('.x-win__bar') ? t.closest<HTMLElement>('[data-win]')?.dataset.win : undefined;
  const dockKey = t.closest('.x-dock__item') ? dockItems.value.find((d) => d.title === t.closest('.x-dock__item')!.getAttribute('aria-label'))?.key : undefined;
  const icon = t.closest('.site-icons .hd-app-icon') ? ICONS.find((i) => i.label === t.closest('.hd-app-icon')!.textContent?.trim()) : undefined;
  const winItems = (k: string): XMenuItem[] => { const w = wins.value.find((x) => x.key === k)!; return [
    { id: 'minimise', label: w.min ? 'Show' : 'Minimise', icon: 'minimize' }, { id: 'maximise', label: w.snap === 'max' ? 'Restore' : 'Maximise', icon: 'maximize' },
    { id: 'snap-left', label: 'Snap left' }, { id: 'snap-right', label: 'Snap right' }, { id: 'layouts', label: 'Snap layouts…', icon: 'split' },
    { id: 'close', label: 'Close window', icon: 'close', divider: true, destructive: true }]; };
  const winAct = (k: string) => (id: string) => {
    const w = wins.value.find((x) => x.key === k); if (!w) return;
    if (id === 'minimise') { if (w.min) dockItem(k); else minimiseWin(k); } else if (id === 'maximise') toggleMax(k); else if (id === 'close') closeWin(k);
    else if (id === 'snap-left') w.snap = { layout: 'halves', zone: 0 }; else if (id === 'snap-right') w.snap = { layout: 'halves', zone: 1 };
    else if (id === 'layouts') { focus(k); picker.value = true; }
  };
  if (bar) at(winItems(bar), 'Window', winAct(bar));
  else if (dockKey) at([...winItems(dockKey), { id: 'dock', label: 'Dock settings…', icon: 'settings', divider: true }], 'Dock item', (id) => (id === 'dock' ? (dockOpen.value = true) : winAct(dockKey)(id)));
  else if (t.closest('nav.x-dock')) at([{ id: 'dock', label: 'Dock settings…', icon: 'settings' }, { id: 'main', label: 'Overview', icon: 'grid' }], 'Dock', (id) => (id === 'dock' ? (dockOpen.value = true) : toggle('main')));
  else if (icon) at([{ id: 'open', label: `Open ${icon.label}`, icon: icon.icon }], icon.label, () => icon.open());
  else at([
    { id: 'add', label: 'Add widgets…', icon: 'add' }, { id: 'edit', label: editWidgets.value ? 'Done editing' : 'Edit desktop', icon: 'edit' },
    { id: 'dock', label: 'Dock settings…', icon: 'settings', divider: true }, { id: 'desktop', label: 'Show the desktop', icon: 'home' }, { id: 'main', label: 'Overview', icon: 'grid' },
  ], 'Desktop', (id) => {
    if (id === 'add' || id === 'edit') { closeOverlays(); editWidgets.value = id === 'add' ? true : !editWidgets.value; }
    else if (id === 'dock') dockOpen.value = true; else if (id === 'desktop') showDesktop(); else toggle('main');
  });
}
/** editing the desktop moves the windows out of the way (as Show the desktop), Done brings them back */
watch(editWidgets, (on) => { const up = wins.value.some((w) => !w.min); if (on === up) showDesktop(); });
/* ---------- resizing ---------- */
const HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
/** moving or resizing a window: no text selection anywhere on the page until the button is released (the browser
 * otherwise selects text under the pointer as it crosses the page and the snap picker) */
const grabbing = ref(false);
function noSelect(e: PointerEvent) { e.preventDefault(); window.getSelection()?.removeAllRanges(); grabbing.value = true; }
/* cancelling pointerdown does not stop Chrome's selection (that starts on the mousedown after it), so while a window is held
 * every new selection is refused and the whole document is unselectable */
function refuseSelect(e: Event) { if (grabbing.value) e.preventDefault(); }
watch(grabbing, (on) => document.documentElement.classList.toggle('site-grab', on));
onMounted(() => { document.addEventListener('selectstart', refuseSelect); document.addEventListener('mousedown', refuseMouse, true); });
onBeforeUnmount(() => { document.removeEventListener('selectstart', refuseSelect); document.removeEventListener('mousedown', refuseMouse, true); document.documentElement.classList.remove('site-grab'); });
function refuseMouse(e: MouseEvent) { if (grabbing.value) e.preventDefault(); }
type Handle = (typeof HANDLES)[number];
const MIN_W = 320, MIN_H = 220;
let rs: { key: string; h: Handle; px: number; py: number; r: Rect; id: number } | null = null;
function rsDown(w: Win, h: Handle, e: PointerEvent) {
  if (e.button > 0) return;
  e.stopPropagation();
  // a snapped or maximised window becomes floating at the size it has now, then follows the pointer
  const r0 = rectOf(w); Object.assign(w, r0); w.snap = null;
  focus(w.key);
  noSelect(e);
  rs = { key: w.key, h, px: e.clientX, py: e.clientY, r: r0, id: e.pointerId };
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}
function rsMove(e: PointerEvent) {
  if (!rs || rs.id !== e.pointerId) return;
  const w = wins.value.find((x) => x.key === rs!.key); if (!w) return;
  const dx = e.clientX - rs.px, dy = e.clientY - rs.py, a = work.value, r0 = rs.r;
  let { x, y, w: ww, h: hh } = r0;
  if (rs.h.includes('e')) ww = Math.min(a.x + a.w - x, Math.max(MIN_W, r0.w + dx));
  if (rs.h.includes('s')) hh = Math.min(a.y + a.h - y, Math.max(MIN_H, r0.h + dy));
  if (rs.h.includes('w')) { x = Math.max(a.x, Math.min(r0.x + r0.w - MIN_W, r0.x + dx)); ww = r0.x + r0.w - x; }
  if (rs.h.includes('n')) { y = Math.max(a.y, Math.min(r0.y + r0.h - MIN_H, r0.y + dy)); hh = r0.y + r0.h - y; }
  Object.assign(w, { x: Math.round(x), y: Math.round(y), w: Math.round(ww), h: Math.round(hh) });
}
function rsUp() { rs = null; grabbing.value = false; }

function ctxPick(id: string) { const c = ctx.value; ctx.value = null; c?.act(id); }
/** the settings panel opens beside the dock, on the inner side of its edge */
const dockPanelAt = computed(() => {
  const o = `${dockThickness(dockSet.size) + 5 * GAP}px`; // 104 px beside the default dock, as in the design: clear of its edit outline
  return dockSet.pos === 'left' ? { left: o, top: '24px' } : dockSet.pos === 'right' ? { right: o, top: '24px' } : dockSet.pos === 'top' ? { top: o, left: 'calc(50% - 190px)' } : { bottom: o, left: 'calc(50% - 190px)' };
});
const ICONS = [...listed('desktop').map((d) => ({ key: `doc:${d.id}`, label: d.label, icon: d.icon, color: d.color, open: () => openWin('doc', d.id) }))];
/** the dock: the open windows, in the order they were opened */
const dockItems = computed<DockItem[]>(() => wins.value.map((w) => {
  const { w: ww, h } = rectOf(w);
  if (w.kind === 'app') { const a = mockApp(w.ref); return { key: w.key, title: w.ref, icon: a.icon, color: a.color, tone: a.tone, w: ww, h }; }
  if (w.kind === 'phone') return { key: w.key, ...PHONE, w: ww, h };
  const d = doc(w.ref as DocId); return { key: w.key, title: d.title, icon: d.icon, color: d.color, w: ww, h };
}));
/** a dock item: brings its window up, or minimises it when it is already in front */
function dockItem(key: string) { const w = wins.value.find((x) => x.key === key); if (w && !w.min && focused.value === key) minimiseWin(key); else focus(key); }

/* ---------- keys ---------- */
/** Super pressed and released alone (where the OS lets the browser see it) opens or closes the Overview */
let superAlone = false;
function onKeyUp(e: KeyboardEvent) { if (e.key === 'Meta' && superAlone) { superAlone = false; toggle('main'); } }
function onKey(e: KeyboardEvent) {
  superAlone = e.key === 'Meta';
  if (e.key === 'Escape') { closeOverlays(); picker.value = false; pickedLayout = null; dockOpen.value = false; editWidgets.value = false; ctx.value = null; return; }
  /* Super, or Ctrl+Alt where the system keeps Super for itself (as cloud-companion's desktop) */
  const sup = e.metaKey || (e.ctrlKey && e.altKey);
  if (sup && e.key === ' ') { e.preventDefault(); toggle('launcher'); return; }
  if (sup && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); toggle('events'); return; }
  if (sup && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); closeOverlays(); showDesktop(); return; }
  if (sup && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); closeOverlays(); picker.value = !picker.value; pickedLayout = null; return; }
  if (picker.value && /^[1-9]$/.test(e.key)) {
    const n = Number(e.key) - 1;
    if (!pickedLayout) { if (LAYOUT_IDS[n]) pickedLayout = LAYOUT_IDS[n]!; }
    else if (n < LAYOUTS[pickedLayout].zones.length) pickLayout(pickedLayout, n);
    return;
  }
  const fw = focusedWin.value;
  if (sup && fw && e.key.startsWith('Arrow')) {
    e.preventDefault();
    if (e.key === 'ArrowLeft') fw.snap = { layout: 'halves', zone: 0 };
    else if (e.key === 'ArrowRight') fw.snap = { layout: 'halves', zone: 1 };
    else if (e.key === 'ArrowUp') fw.snap = 'max';
    else fw.snap = null;
    return;
  }
  // Super+Tab (where the OS lets the browser see it) opens the windows overview, as in Desktop v2
  if (e.metaKey && e.key === 'Tab' && !overview.value) { e.preventDefault(); toggle('overview'); return; }
  if (overview.value) {
    const n = overviewWins.value.length;
    if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); sel.value = (sel.value + 1) % n; }
    else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) { e.preventDefault(); sel.value = (sel.value - 1 + n) % n; }
    else if (e.key === 'Enter' && n) { e.preventDefault(); focus(overviewWins.value[sel.value]!.key); closeOverlays(); }
    return;
  }
  if ((launcher.value || main.value) && document.activeElement?.tagName !== 'INPUT') {
    if (e.key === 'Backspace') query.value = query.value.slice(0, -1);
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) query.value += e.key;
  }
}
let ro: ResizeObserver | undefined;
function measure() { if (areaEl.value) { size.w = areaEl.value.clientWidth; size.h = areaEl.value.clientHeight; } }
onMounted(async () => {
  widgetsOn.value = true;
  try { if (!localStorage.getItem('etesian-desktop-tip')) { window.setTimeout(() => (tip.value = true), 1500); localStorage.setItem('etesian-desktop-tip', '1'); } } catch { tip.value = true; }
  measure();
  ro = new ResizeObserver(measure); if (areaEl.value) ro.observe(areaEl.value);
  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKeyUp);
  await nextTick();
  // first view: the overview page on the left, the interactive phone on the right
  const p = phoneSize();
  const room = R.value - L.value - ICONS_W - p.w - 3 * 24;
  const ow = Math.max(560, Math.min(900, room));
  openWin('phone', 'phone', { x: Math.max(L.value + 24 + Math.min(ow, room) + 24, R.value - ICONS_W - p.w - 24), y: GAP + 8 });
  openWin('doc', 'overview', { x: L.value + 24, y: GAP + 8, w: ow, h: Math.min(860, size.h - 2 * GAP - 16) });
});
onBeforeUnmount(() => { ro?.disconnect(); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); });
</script>

<template>
  <div class="x-desktop site-desk hd-on-home">
    <SiteMenuBar :app="barApp" :active="events ? 'events' : status ? 'status' : null" @events="toggle('events')" @status="toggle('status')" @select="onMenu" />
    <div ref="areaEl" class="x-desktop__area x-v2 site-desk__area" :class="{ 'x-v2--dock-edit': dockOpen }" @contextmenu="onContext" @pointerdown="onAreaDown" @pointermove="onAreaMove" @pointerup="onAreaUp" @pointercancel="onAreaUp" @dblclick="onAreaDbl">
      <!-- desktop icons -->
      <ul class="site-icons" :style="{ right: `${ins.r + 8}px`, top: `${ins.t + 12}px`, bottom: `${ins.b + 12}px` }" aria-label="Desktop">
        <li v-for="i in ICONS" :key="i.key"><HdAppIcon :label="i.label" :icon="i.icon" :color="i.color" :size="48" @click="i.open()" /></li>
      </ul>

      <!-- Belle widgets on the wallpaper, under the windows (Super+D shows them); clocks, so only drawn in the browser -->
      <SiteWidgets v-if="widgetsOn" v-model:editing="editWidgets" :left="L" :top="ins.t" />

      <!-- windows -->
      <template v-for="w in visible" :key="w.key">
        <XWin v-if="w.kind === 'app'" :data-win="w.key" :app="w.ref" v-bind="rectOf(w)" :z="w.z" :focused="focused === w.key" :tiled="w.snap !== null" :dragging="dragWin?.key === w.key"
          :id-prefix="`site-${w.ref}`" @close="closeWin(w.key)" @minimise="minimiseWin(w.key)" @maximise="toggleMax(w.key)" />
        <DocWin v-else-if="w.kind === 'phone'" :data-win="w.key" :title="PHONE.title" :icon="PHONE.icon" :color="PHONE.color" v-bind="rectOf(w)" :z="w.z" :focused="focused === w.key" :tiled="w.snap !== null" dark
          @close="closeWin(w.key)" @minimise="minimiseWin(w.key)" @maximise="toggleMax(w.key)">
          <XFit :w="360" :h="720" fit="contain" :max="2" class="site-phonefit"><PhoneUI embedded @navigate="(h: string) => router.push(h)" /></XFit>
        </DocWin>
        <DocWin v-else :data-win="w.key" :title="doc(w.ref as DocId).title" :icon="doc(w.ref as DocId).icon" :color="doc(w.ref as DocId).color" v-bind="rectOf(w)" :z="w.z" :focused="focused === w.key" :tiled="w.snap !== null"
          @close="closeWin(w.key)" @minimise="minimiseWin(w.key)" @maximise="toggleMax(w.key)">
          <PageRenderer :page="doc(w.ref as DocId)" />
        </DocWin>
      </template>

      <!-- resizing from the edges and corners: handles over each window's border, at its stacking level -->
      <div v-for="w in visible" :key="`rs-${w.key}`" class="site-rs" :style="{ left: `${rectOf(w).x}px`, top: `${rectOf(w).y}px`, width: `${rectOf(w).w}px`, height: `${rectOf(w).h}px`, zIndex: w.z }">
        <span v-for="h in HANDLES" :key="h" :class="`site-rs__h site-rs__${h}`" :data-rs="h" @pointerdown="rsDown(w, h, $event)" @pointermove="rsMove" @pointerup="rsUp" @pointercancel="rsUp"></span>
      </div>

      <!-- snapping feedback while dragging -->
      <!-- the zones of the layout under the pointer (a side edge: the halves; the top picker: the hovered layout), numbered, the target lit -->
      <XZones v-if="dragWin && dragZone" :layout="dragZone.layout" :area="work" :hot="dragZone.zone" :app="winTitle(dragWin)" />
      <XLayoutPicker v-if="picker || drag?.top" class="site-lpick" :hints="!drag?.top" :layout="drag?.hot && drag.hot !== 'max' ? drag.hot.layout : undefined" :zone="drag?.hot && drag.hot !== 'max' ? drag.hot.zone : -1"
        :style="{ left: `${Math.max(L, (L + R - 640) / 2)}px`, top: '10px' }" @pick="pickLayout" />
      <div v-if="dragWin && drag!.hot === 'max'" class="x-zones"><div class="x-zones__z is-hot" :style="{ left: `${maxRect.x}px`, top: `${maxRect.y}px`, width: `${maxRect.w}px`, height: `${maxRect.h}px` }"><span class="x-zones__cap">Release to maximise {{ winTitle(dragWin) }}</span></div></div>

      <!-- overlays -->
      <div v-if="launcher || status" class="site-scrim" @pointerdown="closeOverlays"></div>
      <XLauncher v-if="launcher" v-model:query="query" @open="openApp" />
      <Transition name="x-ov"><SiteOverview v-if="main" v-model:selected="sel" v-model:query="query" :wins="overviewWins" :width="size.w" :height="size.h"
        @focus="(k: string) => { focus(k); closeOverlays(); }" @open="openApp" @close="closeOverlays">
        <template #preview="{ win }"><WinPreview :win="win" id-prefix="ov" /></template>
      </SiteOverview></Transition>
      <Transition name="x-slide"><SiteEventsPanel v-if="events" /></Transition>
      <XStatusPanel v-if="status" />
      <SiteWindows v-if="overview" v-model:level="level" v-model:selected="sel" :wins="overviewWins" :left="L" :width="size.w" :height="size.h"
        @open="(k: string) => { focus(k); closeOverlays(); }" @close="closeOverlays">
        <template #preview="{ win }"><WinPreview :win="win" id-prefix="ov" /></template>
      </SiteWindows>

      <!-- dock: Overview | the open windows | recycle bin -->
      <SiteDock :items="dockItems" :position="dockSet.pos" :size="dockSet.size" :auto-hide="dockSet.vis !== 'always'" :panel="dockSet.panel" :editing="dockOpen" :launcher="dockSet.launcher" :trash="dockSet.trash" :previews="dockSet.previews"
        @remove="(k: string) => (k === 'launcher' || k === 'trash' ? (dockSet[k] = false) : closeWin(k))" @move="(p: DockPos) => (dockSet.pos = p)" @settings="dockOpen = !dockOpen" :active="focused ?? undefined" :launcher-active="main" @launcher="toggle('main')" @item="dockItem">
        <template #preview="{ item }"><WinPreview :win="item" id-prefix="dock" /></template>
      </SiteDock>
      <!-- right-click menus: what is under the pointer decides the menu -->
      <XContextMenu :open="!!ctx" :items="ctx?.items ?? []" :x="ctx?.x" :y="ctx?.y" :label="ctx?.label" @select="ctxPick" @update:open="(v: boolean) => { if (!v) ctx = null; }" />
      <div class="site-tip"><HdInfoBanner v-model:open="tip" inline icon="info" :timeout="9000" text="Right-click the desktop to edit it and add widgets; right-click a title bar, an icon or the dock for theirs." /></div>
      <div v-if="dockOpen" class="x-editbanner hd-on-overlay"><HdIcon name="edit" :size="18" /><b>Edit dock</b><span>Drag the handle to any screen edge · × removes · everything else is in the settings</span><XKey keys="Esc" /> Done</div>
      <XDockSettings v-if="dockOpen" v-model:position="dockSet.pos" v-model:panel="dockSet.panel" :panel="dockSet.panel" :position="dockSet.pos" :size="dockSet.size" :visibility="dockSet.vis" v-model:size="dockSet.size" v-model:visibility="dockSet.vis" :previews="dockSet.previews" :launcher="dockSet.launcher" :trash="dockSet.trash" :style="dockPanelAt" @widget="onDockWidget" @done="dockOpen = false" />
    </div>
  </div>
</template>

<style>
.site-desk { position: fixed; inset: 0; display: flex; flex-direction: column; overflow: hidden; color: var(--hd-c-fg);
  background: radial-gradient(1200px 700px at 70% 30%, color-mix(in srgb, var(--hd-accent) 22%, transparent), transparent 70%), var(--hd-surface-home); }
.site-desk__area { position: relative; flex: 1; min-height: 0; overflow: hidden; }
.site-rs { position: absolute; pointer-events: none; }
.site-rs__h { position: absolute; pointer-events: auto; touch-action: none; }
.site-rs__n, .site-rs__s { left: 10px; right: 10px; height: 8px; cursor: ns-resize; }
.site-rs__n { top: -4px; } .site-rs__s { bottom: -4px; }
.site-rs__e, .site-rs__w { top: 10px; bottom: 10px; width: 8px; cursor: ew-resize; }
.site-rs__e { right: -4px; } .site-rs__w { left: -4px; }
.site-rs__ne, .site-rs__nw, .site-rs__se, .site-rs__sw { width: 16px; height: 16px; }
.site-rs__ne { top: -6px; right: -6px; cursor: nesw-resize; } .site-rs__sw { bottom: -6px; left: -6px; cursor: nesw-resize; }
.site-rs__nw { top: -6px; left: -6px; cursor: nwse-resize; } .site-rs__se { bottom: -6px; right: -6px; cursor: nwse-resize; }
.site-tip { position: absolute; z-index: 42; left: 50%; bottom: 24px; transform: translateX(-50%); width: min(560px, 80%); }
.site-icons { position: absolute; z-index: 0; top: 12px; right: 8px; bottom: 12px; margin: 0; padding: 0; list-style: none; display: grid; grid-auto-flow: column; grid-template-rows: repeat(auto-fill, 92px); direction: rtl; gap: 0 4px; }
.site-icons li { direction: ltr; width: 92px; display: flex; justify-content: center; }
.site-icons .hd-app-icon { width: 88px; cursor: pointer; }
.site-icons .hd-app-icon__label { font-size: var(--hd-font-size-xsmall); text-shadow: 0 1px 3px rgba(0,0,0,.8); }
.site-desk .x-win__bar { cursor: default; }
.site-desk .x-win .x-win__body { position: relative; }
.site-phonefit { height: 100%; }
.site-scrim { position: absolute; inset: 0; z-index: 44; }
.site-prevbar { flex: none; height: 44px; display: flex; align-items: center; padding: 0 14px; background: var(--hd-surface-chrome); color: var(--hd-c-fg); font: var(--hd-font-weight-light) 21px/1 var(--hd-font-family-light); }
.site-prevbody { flex: 1; min-height: 0; display: flex; overflow: hidden; background: var(--hd-c-bg); color: var(--hd-c-fg); }
.site-prevbody > * { flex: 1; min-width: 0; }
.site-prevphone { background: #0c0c0d; }
html.site-grab, html.site-grab * { -webkit-user-select: none !important; user-select: none !important; }
</style>
