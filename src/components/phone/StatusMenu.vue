<script setup lang="ts">
/**
 * The N9 status menu (design repo Phone v2, from the N9's own status menu): opened by tapping the status bar, drawn on black
 * at the top over the dimmed screen. Profile as a segmented bar (Silent | Beep | Ringing, where Ringing is also the ringer
 * volume), the flat magenta Volume bar, then rows of a lit squircle, a bold title and its state. No switches: it is the
 * pure N9 menu, as a fresh phone has it (the toggle strip is an optional addition). Tap below it or swipe it up to close.
 */
import { ref } from 'vue';
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
const emit = defineEmits<{ close: [] }>();
const ringer = ref(2); // Silent | Beep | Ringing
const volume = ref(66);
const ring = ref(60);
type Row = [icon: string, title: string, state: string, on: boolean];
const rows = ref<Row[]>([['wifi', 'HomeNet', 'Connected', true], ['bluetooth', 'Bluetooth', 'Off', false], ['battery', 'Battery', '78%', true]]);
function bt(r: Row) { if (r[1] !== 'Bluetooth') return; r[3] = !r[3]; r[2] = r[3] ? 'On' : 'Off'; }
/** a bar follows the finger: the value is where it is pressed */
function slide(e: PointerEvent, set: (v: number) => void) {
  const el = e.currentTarget as HTMLElement, r = el.getBoundingClientRect();
  const at = (x: number) => set(Math.round(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))));
  el.setPointerCapture(e.pointerId); at(e.clientX);
  el.onpointermove = (m) => at(m.clientX); el.onpointerup = () => { el.onpointermove = null; el.onpointerup = null; };
}
let y0 = 0;
</script>
<template>
  <div class="ph-sm-wrap" @click.self="emit('close')">
    <div class="ph-sm hd-on-home" role="dialog" aria-label="Status menu" @pointerdown="y0 = $event.clientY" @pointerup="$event.clientY < y0 - 40 && emit('close')">
      <div class="ph-sm__label">Profile</div>
      <div class="ph-sm__seg" role="radiogroup" aria-label="Profile">
        <span v-for="(n, i) in ['Silent', 'Beep']" :key="n" role="radio" :aria-checked="i === ringer ? 'true' : 'false'" :class="{ sel: i === ringer }" @click="ringer = i">{{ n }}</span>
        <span class="ph-sm__ring" :class="{ sel: ringer === 2 }" role="slider" aria-label="Ringing volume" :aria-valuenow="ring" aria-valuemin="0" aria-valuemax="100" :style="{ '--ring': ring + '%' }"
          @pointerdown="ringer = 2; slide($event, (v) => (ring = v))">Ringing</span>
      </div>
      <div class="ph-sm__label">Volume</div>
      <div class="ph-sm__fill" role="slider" aria-label="Volume" :aria-valuenow="volume" aria-valuemin="0" aria-valuemax="100" @pointerdown="slide($event, (v) => (volume = v))"><i :style="{ width: volume + '%' }" /></div>
      <div class="ph-sm__rows">
        <div v-for="r in rows" :key="r[1]" class="ph-sm__row" :class="{ off: !r[3] }" @click="bt(r)">
          <HdSquircle :size="46" color="#3A3A3A" lighting="lit"><HdIcon :name="r[0]" :size="26" lit /></HdSquircle>
          <span><b>{{ r[1] }}</b><small>{{ r[2] }}</small></span>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.ph-sm-wrap { position: absolute; z-index: 20; inset: 0; background: rgba(0,0,0,.65); }
.ph-sm { position: absolute; inset: 0 0 auto; padding: calc(var(--hd-size-status-bar) + 8px) 5px 6px; background: #000; color: #fff; touch-action: none; }
.ph-sm__label { padding: 10px 0 4px; font: 400 15px/1 var(--hd-font-family-base); }
.ph-sm__seg { display: flex; gap: 4px; height: 17px; }
.ph-sm__seg > span { white-space: nowrap; display: flex; align-items: center; padding: 0 30px 0 3px; background: #23436E; color: #8A9BB4; font: 700 11px/1 var(--hd-font-family-base); cursor: pointer; }
.ph-sm__seg > span.sel { padding-right: 74px; background: #4A9BFF; color: #fff; }
.ph-sm__seg > span.ph-sm__ring { flex: 1; padding-right: 3px; background: linear-gradient(90deg, #23436E var(--ring), #3A3A3A var(--ring)); }
.ph-sm__seg > span.ph-sm__ring.sel { background: linear-gradient(90deg, #4A9BFF var(--ring), #3A3A3A var(--ring)); }
.ph-sm__fill { height: 17px; background: #3A3A3A; cursor: pointer; touch-action: none; }
.ph-sm__fill i { display: block; height: 100%; background: #C800B4; }
.ph-sm__rows { padding: 16px 0 4px 8px; }
.ph-sm__row { display: flex; align-items: center; gap: 14px; min-height: 60px; }
.ph-sm__row > span:last-child { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ph-sm__row b { font: 700 18px/1.1 var(--hd-font-family-base); }
.ph-sm__row small { font: 400 15px/1.15 var(--hd-font-family-base); color: var(--hd-c-fg-secondary); }
.ph-sm__row.off .hd-squircle { filter: brightness(.7); }
.ph-sm__row.off .hd-icon { opacity: .55; }
</style>
