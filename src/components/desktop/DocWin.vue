<script setup lang="ts">
/**
 * A site window in the Desktop v2 style (same markup and classes as the design repo's XWin, so it shares its look):
 * the lit app squircle, the title in light type, a drag area, then minimise / maximise / close. Content scrolls below.
 * Used for content pages and the phone; the design repo's mock apps use XWin itself.
 */
import { computed } from 'vue';
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import HdToolIcon from '@etesian-design/vue/components/HdToolIcon.vue';
const props = withDefaults(defineProps<{ title: string; icon: string; color: string; x: number; y: number; w: number; h: number; z?: number; focused?: boolean; tiled?: boolean; dark?: boolean }>(), { z: 1 });
const emit = defineEmits<{ close: []; minimise: []; maximise: [] }>();
const style = computed(() => ({ left: `${props.x}px`, top: `${props.y}px`, width: `${props.w}px`, height: `${props.h}px`, zIndex: props.z }));
</script>
<template>
  <section class="x-win" :class="{ 'is-focused': focused, 'is-tiled': tiled }" :aria-label="`${title} window`" :style="style">
    <header class="x-win__bar hd-on-chrome">
      <span class="x-win__lead"><HdSquircle :size="22" :color="color" lighting="lit" class="x-win__appicon"><HdIcon :name="icon" :size="13" lit /></HdSquircle></span>
      <h2 class="x-win__title">{{ title }}</h2>
      <span class="x-win__drag" aria-hidden="true"></span>
      <slot name="actions" />
      <span class="x-win__sep" aria-hidden="true"></span>
      <span class="x-win__ctl">
        <HdToolIcon icon="minimize" label="Minimise" @click="emit('minimise')" />
        <HdToolIcon icon="maximize" label="Maximise" @click="emit('maximise')" />
        <HdToolIcon icon="close" label="Close" class="x-win__close" @click="emit('close')" />
      </span>
    </header>
    <div class="x-win__body" :class="dark ? 'hd-on-home site-win__dark' : 'hd-on-page'">
      <div class="site-win__scroll"><slot /></div>
    </div>
  </section>
</template>
<style>
.site-win__scroll { flex: 1; min-width: 0; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.site-win__dark { background: #0c0c0d; }
.x-win__bar { touch-action: none; }
</style>
