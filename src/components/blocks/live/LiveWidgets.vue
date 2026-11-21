<script setup lang="ts">
/** One Belle widget at a time: pick its kind and size, and switch on edit mode to see its handles and ✕ badge. */
import { ref, computed, onMounted } from 'vue';
import BelleWidget, { type BelleKind } from '@etesian-design/shell/widgets/BelleWidget.vue';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import HdSwitch from '@etesian-design/vue/components/HdSwitch.vue';
const SETS: { name: string; kinds: [BelleKind, string][] }[] = [
  { name: 'Clocks', kinds: [['flipclock', 'Flip'], ['bigclock', 'Large'], ['gearclock', 'Gear'], ['analog', 'Square'], ['lcdclock', 'Digital'], ['wordclock', 'Word']] },
  { name: 'Switches', kinds: [['switch', 'Switch'], ['toggles', 'Switches'], ['wifi', 'Wi-Fi'], ['fm', 'FM Radio']] },
  { name: 'Information', kinds: [['today', 'Calendar card'], ['agenda', 'Calendar'], ['mail', 'Latest mail'], ['stackmail', 'Email'], ['weather', 'Weather'], ['rss', 'Feed'], ['notes', 'Notes'], ['data', 'Data tracker'], ['music', 'Music'], ['contact', 'Contact'], ['web', 'Website']] },
  { name: 'Translucent', kinds: [['m-clock', 'Clock'], ['m-analog', 'Analog'], ['m-weather', 'Weather'], ['m-calendar', 'Calendar'], ['m-feeds', 'Feeds'], ['m-music', 'Music'], ['m-shortcuts', 'Shortcuts']] },
];
const set = ref(0), kind = ref<BelleKind>('flipclock'), cols = ref<number | undefined>(), rows = ref<number | undefined>(), edit = ref(false);
const pickSet = (i: number) => { set.value = i; kind.value = SETS[i]!.kinds[0]![0]; cols.value = rows.value = undefined; };
const pick = (k: BelleKind) => { kind.value = k; cols.value = rows.value = undefined; };
const sizes = [[2, 1], [2, 2], [4, 2], [4, 3]] as const;
/** clocks show the viewer's time, so the widget is drawn in the browser only (the built page has the build's time) */
const ready = ref(false); onMounted(() => { ready.value = true; });
const label = computed(() => SETS[set.value]!.kinds.find((k) => k[0] === kind.value)?.[1]);
</script>
<template>
  <div class="live-col">
    <div class="live-row"><HdButton v-for="(s, i) in SETS" :key="s.name" size="small" :pressed="set === i" @click="pickSet(i)">{{ s.name }}</HdButton></div>
    <div class="live-row"><HdButton v-for="k in SETS[set]!.kinds" :key="k[0]" size="small" :pressed="kind === k[0]" @click="pick(k[0])">{{ k[1] }}</HdButton></div>
    <div class="lw hd-on-home"><BelleWidget v-if="ready" :key="kind + cols + rows" :kind="kind" v-bind="cols && rows ? { cols, rows } : {}" :editing="edit" :cell="80" /></div>
    <div class="live-row"><span class="live-lbl">Size in cells</span><HdButton v-for="s in sizes" :key="s.join()" size="small" :pressed="cols === s[0] && rows === s[1]" @click="cols = s[0]; rows = s[1]">{{ s[0] }}×{{ s[1] }}</HdButton></div>
    <HdSwitch v-model="edit" label="Edit mode" />
    <span class="live-lbl">{{ label }}<template v-if="edit">: drag to move, corner handles resize in whole cells, ✕ removes.</template></span>
  </div>
</template>
<style>
.lw { min-height: 260px; display: grid; place-items: center; padding: 16px; border-radius: var(--hd-radius-control); background: linear-gradient(160deg, #4d5a63, #1b2226 60%, #0b0e10); overflow: auto; }
</style>
