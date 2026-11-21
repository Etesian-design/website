<script setup lang="ts">
import { ref } from 'vue';
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdFastScroll from '@etesian-design/vue/components/HdFastScroll.vue';
const first = ['Aino', 'Aleksi', 'Anna', 'Bea', 'Carlos', 'Chen', 'Dana', 'Eero', 'Elena', 'Femi', 'Greta', 'Hana', 'Ilkka', 'Jonas', 'Juha', 'Kaisa', 'Kenji', 'Lea', 'Liam', 'Mika', 'Mona', 'Nora', 'Olli', 'Pia', 'Rafael', 'Sara', 'Sven', 'Tomi', 'Ulla', 'Vera', 'Wen', 'Yuki', 'Zoe'];
const groups = [...new Set(first.map((n) => n[0]!))].map((l) => ({ letter: l, names: first.filter((n) => n.startsWith(l)) }));
const HEAD = 24, ROW = 44;
const secs: { letter: string; top: number }[] = [];
groups.reduce((y, g) => { secs.push({ letter: g.letter, top: y + HEAD / 2 }); return y + HEAD + g.names.length * ROW; }, 0);
const list = ref<HTMLElement | null>(null);
const jump = (i: number) => list.value?.scrollTo({ top: secs[i]!.top - HEAD / 2 });
</script>
<template>
  <div class="lf">
    <div ref="list" class="lf__list">
      <template v-for="g in groups" :key="g.letter"><div class="lf__h" :data-fs-letter="g.letter"><hr></div>
        <div v-for="n in g.names" :key="n" class="lf__r"><HdSquircle :size="34" color="#1C1C1E" lighting="flat"><b class="lf__i">{{ n[0] }}</b></HdSquircle>{{ n }}</div></template>
    </div>
    <HdFastScroll :sections="secs" :container="list" label="Fast scroll" @jump="jump" />
  </div>
</template>
<style>
.lf { position: relative; height: 340px; max-width: 320px; margin: 0 auto; background: #DDE1E5; color: #111; overflow: hidden; border-radius: var(--hd-radius-control); }
.lf__list { height: 100%; overflow: auto; scrollbar-width: none; }
.lf__h { height: 24px; display: flex; align-items: center; padding: 0 47px 0 8px; }
.lf__h hr { flex: 1; border: 0; border-top: 1px solid #fff; margin: 0; }
.lf__r { height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 55px 0 10px; font-weight: 600; }
.lf__i { color: #fff; }
</style>
