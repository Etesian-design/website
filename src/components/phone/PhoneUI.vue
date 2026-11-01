<script setup lang="ts">
/**
 * The Etesian phone, interactive: lock screen (swipe sideways to unlock), the three home views (Events, Applications,
 * Open applications) side by side with page dots, and apps that open full screen. N9 gestures: swipe in from the left or
 * right edge to minimise, swipe down from the top edge to close. Long-press in Open applications for edit mode.
 * Fills its container: the whole viewport on a phone, a scaled 360 × 720 screen inside a desktop window.
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import HdStatusBar from '@etesian/components/HdStatusBar.vue';
import StatusMenu from './StatusMenu.vue';
import HdAppGrid from '@etesian/components/HdAppGrid.vue';
import HdAppIcon from '@etesian/components/HdAppIcon.vue';
import HdPageIndicator from '@etesian/components/HdPageIndicator.vue';
import HdEventsHeader from '@etesian/components/HdEventsHeader.vue';
import HdSectionHeader from '@etesian/components/HdSectionHeader.vue';
import HdEventsFeedItem from '@etesian/components/HdEventsFeedItem.vue';
import HdLockScreenStack from '@etesian/components/HdLockScreenStack.vue';
import HdTaskCard from '@etesian/components/HdTaskCard.vue';
import HdTaskEditBar from '@etesian/components/HdTaskEditBar.vue';
import HdInfoBanner from '@etesian/components/HdInfoBanner.vue';
import XFit from '@etesian/stories/explorations/parts/XFit.vue';
import AppSurface from './AppSurface.vue';
import { PHONE_APPS, phoneApp } from '../../lib/phoneApps';
import { provideNav } from '../../lib/nav';
import { useClock } from '../../lib/clock';
import { EVENTS, type DocId } from '../../content/site';

const props = withDefaults(defineProps<{ startLocked?: boolean; startApp?: string; embedded?: boolean }>(), { startLocked: true });
const emit = defineEmits<{ navigate: [href: string] }>();
const { time, longDate, dayName, dayMonth } = useClock();

/* ---------- lock screen ---------- */
const locked = ref(props.startLocked);
const statusOpen = ref(false);
const lockDx = ref(0);
const lockAnim = ref(false);
let lockStart: { x: number; id: number } | null = null;
function lockDown(e: PointerEvent) { if (e.button > 0 || (e.target as HTMLElement).closest('button')) return; lockStart = { x: e.clientX, id: e.pointerId }; lockAnim.value = false; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }
function lockMove(e: PointerEvent) { if (lockStart?.id === e.pointerId) lockDx.value = (e.clientX - lockStart.x) / scaleOf(e.currentTarget as HTMLElement); }
function lockUp(e: PointerEvent) {
  if (lockStart?.id !== e.pointerId) return;
  lockStart = null; lockAnim.value = true;
  const w = root.value?.offsetWidth ?? 360;
  if (Math.abs(lockDx.value) > w * 0.22) unlock(Math.sign(lockDx.value) || 1); else lockDx.value = 0;
}
function unlock(dir = 1) {
  lockAnim.value = true;
  lockDx.value = dir * (root.value?.offsetWidth ?? 360) * 1.05;
  window.setTimeout(() => { locked.value = false; lockDx.value = 0; }, 260);
}
const lockItems = EVENTS.notifications.map((n) => ({ message: n.text, source: n.title, time: 'now', icon: n.icon, accent: n.color }));

/* ---------- home views ---------- */
const VIEWS = ['Events', 'Applications', 'Open applications'];
const track = ref<HTMLElement>();
const page = ref(1);
function goTo(i: number, smooth = true) { const t = track.value; if (t) t.scrollTo({ left: i * t.clientWidth, behavior: smooth ? 'smooth' : 'instant' }); page.value = i; }
function onScroll() { const t = track.value; if (t && t.clientWidth) page.value = Math.round(t.scrollLeft / t.clientWidth); }
/* mouse: drag the home views like a finger (touch uses native scroll snapping) */
let drag: { x: number; left: number; moved: boolean; id: number } | null = null;
let suppressClick = false;
function trackDown(e: PointerEvent) { if (e.pointerType !== 'mouse' || e.button !== 0 || !track.value) return; drag = { x: e.clientX, left: track.value.scrollLeft, moved: false, id: e.pointerId }; }
function trackMove(e: PointerEvent) {
  if (!drag || drag.id !== e.pointerId || !track.value) return;
  const dx = (e.clientX - drag.x) / scaleOf(track.value);
  if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; track.value.setPointerCapture(e.pointerId); track.value.classList.add('is-dragging'); }
  if (drag.moved) track.value.scrollLeft = drag.left - dx;
}
function trackUp(e: PointerEvent) {
  if (!drag || drag.id !== e.pointerId || !track.value) return;
  const t = track.value; t.classList.remove('is-dragging');
  if (drag.moved) {
    suppressClick = true; window.setTimeout(() => (suppressClick = false), 0);
    const dx = (e.clientX - drag.x) / scaleOf(t), cur = Math.round(drag.left / t.clientWidth);
    goTo(Math.max(0, Math.min(VIEWS.length - 1, Math.abs(dx) > t.clientWidth * 0.15 ? cur - Math.sign(dx) : cur)));
  }
  drag = null;
}
function trackClickCapture(e: MouseEvent) { if (suppressClick) { e.stopPropagation(); e.preventDefault(); } }

/* ---------- apps ---------- */
const current = ref<string | null>(null);
const running = ref<string[]>([]);
const loading = ref<string | null>(null);
const enterFrom = ref<'right' | 'left'>('right');
const hintShown = ref(false);
const hint = ref(false);
function launch(key: string, from: 'right' | 'left' = 'right', delay = 320) {
  const a = phoneApp(key);
  if (!a) return;
  if (a.href) { emit('navigate', a.href); return; }
  loading.value = key;
  window.setTimeout(() => {
    loading.value = null; enterFrom.value = from; appT.value = { x: 0, y: 0, o: 1, anim: false };
    current.value = key;
    running.value = [key, ...running.value.filter((k) => k !== key)];
    if (!hintShown.value) { hintShown.value = true; window.setTimeout(() => (hint.value = true), 450); }
  }, delay);
}
function openDoc(id: DocId | 'try-phone') { if (id !== 'try-phone') { locked.value = false; launch(id, 'right', 0); } }
provideNav({ open: openDoc, shell: 'phone' });

/* the app follows the finger; minimise = slide off sideways, close = follow down and fade */
const appT = ref({ x: 0, y: 0, o: 1, anim: false });
let edge: { mode: 'side' | 'down'; x: number; y: number; id: number } | null = null;
/** peek: swipe up from the bottom edge and hold, the first row of the app grid rises over the app; release on an icon to launch it */
const peek = ref(0), peekAt = ref<string | null>(null);
const PEEK_APPS = computed(() => PHONE_APPS.filter((a) => !a.href).slice(0, 4));
function edgeDown(mode: 'side' | 'down' | 'up', e: PointerEvent) {
  if (e.button > 0 || !current.value) return;
  edge = { mode, x: e.clientX, y: e.clientY, id: e.pointerId }; appT.value.anim = false; hint.value = false;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}
function edgeMove(e: PointerEvent) {
  if (!edge || edge.id !== e.pointerId) return;
  const s = scaleOf(e.currentTarget as HTMLElement);
  if (edge.mode === 'side') appT.value.x = (e.clientX - edge.x) / s;
  else if (edge.mode === 'up') {
    // once fully up it holds, so the finger can move along the row to an icon
    peek.value = peek.value >= 1 ? 1 : Math.min(1, Math.max(0, (edge.y - e.clientY) / s / 90));
    const hit = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-peek]');
    peekAt.value = peek.value >= 1 && hit ? hit.dataset.peek! : null;
  } else { const dy = Math.max(0, (e.clientY - edge.y) / s); appT.value.y = dy; appT.value.o = Math.max(0.2, 1 - dy / 600); }
}
function edgeUp(e: PointerEvent) {
  if (!edge || edge.id !== e.pointerId) return;
  const m = edge.mode; edge = null; appT.value.anim = true;
  if (m === 'up') { const k = peekAt.value; peek.value = 0; peekAt.value = null; if (k && k !== current.value) launch(k, 'right', 0); return; }
  if (m === 'side' && Math.abs(appT.value.x) > 60) minimise(Math.sign(appT.value.x));
  else if (m === 'down' && appT.value.y > 110) closeApp();
  else appT.value = { x: 0, y: 0, o: 1, anim: true };
}
function minimise(dir = 1) {
  const w = root.value?.offsetWidth ?? 360;
  appT.value = { x: dir * w, y: 0, o: 1, anim: true };
  window.setTimeout(() => { current.value = null; hint.value = false; appT.value = { x: 0, y: 0, o: 1, anim: false }; }, 240);
}
function closeApp() {
  const key = current.value; const h = root.value?.offsetHeight ?? 720;
  appT.value = { x: 0, y: h * 0.7, o: 0, anim: true };
  window.setTimeout(() => { current.value = null; running.value = running.value.filter((k) => k !== key); appT.value = { x: 0, y: 0, o: 1, anim: false }; }, 240);
}
const appStyle = computed(() => ({ transform: `translate(${appT.value.x}px, ${appT.value.y}px)`, opacity: appT.value.o, transition: appT.value.anim ? 'transform .24s cubic-bezier(.2,.8,.2,1), opacity .24s' : 'none' }));

/* Open applications: long-press for edit mode (close squircles, Done / Close all) */
const editing = ref(false);
let pressTimer = 0;
function cardPress() { window.clearTimeout(pressTimer); pressTimer = window.setTimeout(() => (editing.value = true), 550); }
function cardRelease() { window.clearTimeout(pressTimer); }
function openCard(key: string) { if (!editing.value) launch(key, 'left', 0); }
function closeCard(key: string) { running.value = running.value.filter((k) => k !== key); if (!running.value.length) editing.value = false; }

/* ---------- misc ---------- */
const root = ref<HTMLElement>();
/** CSS scale of the phone (it is scaled down inside a desktop window): pointer deltas are divided by it */
function scaleOf(el: HTMLElement) { const r = el.getBoundingClientRect(); return el.offsetWidth ? r.width / el.offsetWidth : 1; }
function onKey(e: KeyboardEvent) {
  if (!root.value?.contains(document.activeElement) && !props.embedded && document.activeElement !== document.body) return;
  if (e.key === 'Escape' && current.value) minimise(1);
}
onMounted(() => {
  nextTick(() => goTo(1, false));
  if (props.startApp) { locked.value = false; launch(props.startApp, 'right', 0); }
  if (!props.embedded) window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
const eventsDocs = EVENTS.notifications;
const feedDocs = EVENTS.feeds;
</script>

<template>
  <div ref="root" class="ph hd-on-home" :class="{ 'ph--embedded': embedded }">
    <HdStatusBar :time="time" class="ph__sb" />
    <!-- tapping the status bar opens the N9 status menu, over home and over apps -->
    <button v-if="!locked" type="button" class="ph__sbtap hd-focusable" aria-label="Status menu" @click="statusOpen = true"></button>

    <!-- home: three views side by side -->
    <!-- under a resting lock screen the home is not drawn (it can't be seen; it shows again while the lock is swiped away) -->
    <div class="ph__home" :aria-hidden="locked || !!current ? 'true' : undefined" :style="locked && !lockDx && !lockAnim ? { visibility: 'hidden' } : undefined">
      <div ref="track" class="ph__track" @scroll.passive="onScroll" @pointerdown="trackDown" @pointermove="trackMove" @pointerup="trackUp" @pointercancel="trackUp" @click.capture="trackClickCapture">
        <section class="ph__view ph-events" aria-label="Events">
          <HdEventsHeader :day="dayName" :date="dayMonth" city="Athens" temperature="23°C" weather="partly" />
          <HdSectionHeader title="Notifications" />
          <HdEventsFeedItem v-for="n in eventsDocs" :key="n.page + n.title" :title="n.title" :body="n.text" time="now" :icon="n.icon" :accent="n.color" class="ph-events__item" @click="launch(n.page, 'right', 0)" />
          <HdSectionHeader title="Feeds" />
          <HdEventsFeedItem v-for="n in feedDocs" :key="n.page + n.title" :title="n.title" :body="n.text" time="today" :icon="n.icon" :accent="n.color" class="ph-events__item" @click="launch(n.page, 'right', 0)" />
        </section>
        <section class="ph__view ph-apps" aria-label="Applications">
          <HdAppGrid :columns="4" label="Applications">
            <li v-for="a in PHONE_APPS" :key="a.key">
              <HdAppIcon :label="a.label" :icon="a.icon" :color="a.color" :tone="a.tone" :loading="loading === a.key" :size="54" @click="launch(a.key)" />
            </li>
          </HdAppGrid>
        </section>
        <section class="ph__view ph-open" aria-label="Open applications" @click.self="editing = false">
          <p v-if="!running.length" class="ph-open__none">No open applications.<br />Apps you open wait here as live cards.</p>
          <ul v-else class="ph-open__grid">
            <li v-for="k in running" :key="k" @pointerdown="cardPress" @pointerup="cardRelease" @pointerleave="cardRelease" @contextmenu.prevent="editing = true">
              <HdTaskCard :title="phoneApp(k)!.label" :editing="editing" @open="openCard(k)" @close="closeCard(k)">
                <XFit :w="360" :h="696" :initial="0.4"><div class="ph-open__live" inert><AppSurface :app-key="k" preview /></div></XFit>
              </HdTaskCard>
            </li>
          </ul>
          <HdTaskEditBar v-if="editing" class="ph-open__bar" @done="editing = false" @close-all="running = []; editing = false" />
        </section>
      </div>
      <HdPageIndicator class="ph__dots" :total="3" :current="page" interactive label="Home views" @select="goTo" />
    </div>

    <!-- the open app, with the N9 edge-swipe zones over it -->
    <Transition :name="`ph-app-${enterFrom}`">
      <div v-if="current" :key="current" class="ph__app" :style="appStyle" role="region" :aria-label="phoneApp(current)?.label">
        <AppSurface :app-key="current" @back="minimise(1)" />
        <span class="ph__edge ph__edge--l" aria-hidden="true" @pointerdown="edgeDown('side', $event)" @pointermove="edgeMove" @pointerup="edgeUp" @pointercancel="edgeUp"></span>
        <span class="ph__edge ph__edge--r" aria-hidden="true" @pointerdown="edgeDown('side', $event)" @pointermove="edgeMove" @pointerup="edgeUp" @pointercancel="edgeUp"></span>
        <span class="ph__edge ph__edge--t" aria-hidden="true" @pointerdown="edgeDown('down', $event)" @pointermove="edgeMove" @pointerup="edgeUp" @pointercancel="edgeUp"></span>
        <span class="ph__edge ph__edge--b" aria-hidden="true" @pointerdown="edgeDown('up', $event)" @pointermove="edgeMove" @pointerup="edgeUp" @pointercancel="edgeUp"></span>
        <div v-if="peek > 0" class="ph-peek hd-on-home" :style="{ transform: `translateY(${(1 - peek) * 100}%)` }" aria-label="Applications">
          <span v-for="a in PEEK_APPS" :key="a.key" class="ph-peek__i" :class="{ 'is-hot': peekAt === a.key }" :data-peek="a.key"><HdAppIcon :label="a.label" :icon="a.icon" :color="a.color" :tone="a.tone" :size="54" /></span>
        </div>
      </div>
    </Transition>
    <div class="ph__hint"><HdInfoBanner v-model:open="hint" inline icon="info" :timeout="6000" text="Swipe in from the left or right edge to minimise. Swipe down from the top edge to close." /></div>

    <StatusMenu v-if="statusOpen && !locked" @close="statusOpen = false" />

    <!-- lock screen -->
    <div v-if="locked" class="ph__lock" :style="{ transform: `translateX(${lockDx}px)`, opacity: 1 - Math.min(0.6, Math.abs(lockDx) / 600), transition: lockAnim ? 'transform .26s cubic-bezier(.2,.8,.2,1), opacity .26s' : 'none' }"
      @pointerdown="lockDown" @pointermove="lockMove" @pointerup="lockUp" @pointercancel="lockUp">
      <HdStatusBar :time="time" transparent />
      <div class="ph__lockclock"><div class="ph__locktime">{{ time }}</div><div class="ph__lockdate">{{ longDate }}</div></div>
      <div class="ph__lockcards"><HdLockScreenStack :items="lockItems" :visible="2" /></div>
      <button type="button" class="ph__unlock hd-focusable" @click="unlock(1)">Swipe sideways to unlock</button>
    </div>
  </div>
</template>

<style>
.ph { position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column; background: var(--hd-surface-home); color: var(--hd-c-fg); user-select: none; -webkit-user-select: none; }
.ph__sb { position: relative; z-index: 3; flex: none; }
.ph__home { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.ph__track { flex: 1; min-height: 0; display: flex; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
.ph__track::-webkit-scrollbar { display: none; }
.ph__track.is-dragging { scroll-snap-type: none; cursor: grabbing; }
.ph__view { flex: none; width: 100%; height: 100%; overflow-y: auto; scroll-snap-align: start; scroll-snap-stop: always; scrollbar-width: none; padding-bottom: 28px; }
.ph__view::-webkit-scrollbar { display: none; }
.ph__dots { position: absolute; left: 0; right: 0; bottom: 6px; display: flex; justify-content: center; }
.ph-events .ph-events__item { cursor: pointer; }
.ph-apps { padding-top: 22px; }
.ph-apps .hd-app-icon { cursor: pointer; }
.ph-open { position: relative; padding: 22px 16px 80px; }
.ph-open__none { margin: 40% 24px 0; text-align: center; font: var(--hd-font-weight-light) var(--hd-font-size-large)/1.4 var(--hd-font-family-light); color: var(--hd-c-fg-secondary); }
.ph-open__grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 26px 16px; }
.ph-open .hd-task-card__preview { aspect-ratio: auto; height: auto; }
.ph-open__live { width: 360px; height: 696px; pointer-events: none; }
.ph-open__bar { position: absolute; left: 0; right: 0; bottom: 0; }
.ph__edge--b { left: 0; right: 0; bottom: 0; height: 16px; }
.ph-peek { position: absolute; z-index: 7; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(4, 1fr); justify-items: center; padding: 14px 0 18px; background: rgba(0,0,0,.92); }
.ph-peek__i { border-radius: 12px; padding: 4px 0; }
.ph-peek__i.is-hot { background: rgba(255,255,255,.14); }
.ph__sbtap { position: absolute; z-index: 8; left: 0; right: 0; top: 0; height: var(--hd-size-status-bar); padding: 0; border: 0; background: transparent; cursor: pointer; }
.ph__app { position: absolute; z-index: 4; left: 0; right: 0; bottom: 0; top: var(--hd-size-status-bar); border-radius: 7px 7px 0 0; overflow: hidden; box-shadow: 0 -2px 18px rgba(0,0,0,.35); }
.ph__edge { position: absolute; z-index: 6; touch-action: none; }
.ph__edge--l, .ph__edge--r { top: 0; bottom: 0; width: 14px; }
.ph__edge--l { left: 0; }
.ph__edge--r { right: 0; }
.ph__edge--t { top: 0; left: 14px; right: 14px; height: 14px; }
.ph__edge:hover { background: linear-gradient(var(--ph-edge-dir, 90deg), color-mix(in srgb, var(--hd-accent) 35%, transparent), transparent); cursor: grab; }
.ph__edge--r { --ph-edge-dir: 270deg; }
.ph__edge--t { --ph-edge-dir: 180deg; }
.ph__hint { position: absolute; z-index: 7; left: 10px; right: 10px; bottom: 64px; pointer-events: none; }
.ph__hint > * { pointer-events: auto; }
.ph-app-right-enter-active, .ph-app-left-enter-active { transition: transform .28s cubic-bezier(.2,.8,.2,1) !important; }
.ph-app-right-enter-from { transform: translateX(100%) !important; }
.ph-app-left-enter-from { transform: translateX(-100%) !important; }
.ph__lock { position: absolute; z-index: 10; inset: 0; display: flex; flex-direction: column; color: #fff; touch-action: pan-y; cursor: grab;
  background: radial-gradient(140% 90% at 80% 10%, #2f6b6b 0%, transparent 60%), linear-gradient(160deg, #0e1418 10%, #1d4a4c 55%, #0d2a2c 90%); }
/* no blur-behind on the lock cards here: inside a scaled window, GPU compositing samples the blur from the desktop under
   the window (a wallpaper widget showed through a card). Over the lock's smooth gradient the blur is invisible anyway. */
.ph__lock .hd-lock-card, .ph__lock .hd-lock-stack__strip { -webkit-backdrop-filter: none; backdrop-filter: none; }
.ph__lockclock { padding: 34px 18px 0; text-align: right; }
.ph__locktime { font: 300 88px/1 var(--hd-font-family-light); font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
.ph__lockdate { margin-top: 10px; font: 400 1.125rem/1.3 var(--hd-font-family-base); }
.ph__lockcards { margin-top: auto; padding: 0 14px; }
.ph__unlock { margin: 14px auto 18px; padding: 8px 14px; border: 0; border-radius: 16px; background: transparent; color: rgba(255,255,255,.7); font: 400 .8125rem/1 var(--hd-font-family-base); cursor: pointer; }
.ph__unlock:hover { color: #fff; background: rgba(255,255,255,.08); }
</style>
