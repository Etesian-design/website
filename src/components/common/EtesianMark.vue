<script setup lang="ts">
/**
 * The Etesian logo (design repo, brand/; made by scripts/logo.mjs there): the deep-blue version on light backgrounds,
 * the pearl (white) one on dark ones. `on` names the background it sits on; without it the system's light or dark mode
 * decides (only right where the background follows the system too). At 32 px and below the simplified one, whose
 * strokes still read.
 */
import deep from '../../assets/brand/etesian-deep.svg';
import pearl from '../../assets/brand/etesian-pearl.svg';
import deepSmall from '../../assets/brand/etesian-favicon.svg';
import pearlSmall from '../../assets/brand/etesian-favicon-pearl.svg';
const props = withDefaults(defineProps<{ size?: number; on?: 'light' | 'dark' }>(), { size: 24 });
const light = () => (props.size <= 32 ? deepSmall : deep);
const dark = () => (props.size <= 32 ? pearlSmall : pearl);
</script>
<template>
  <picture class="etesian-mark">
    <source v-if="!on" media="(prefers-color-scheme: dark)" :srcset="dark()">
    <img :src="on === 'dark' ? dark() : light()" :width="size" :height="size" alt="" aria-hidden="true">
  </picture>
</template>
<style>
.etesian-mark, .etesian-mark img { flex: none; display: block; }
</style>
