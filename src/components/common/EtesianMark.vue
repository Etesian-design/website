<script setup lang="ts">
/**
 * The Etesian logo (design repo, brand/; made by scripts/logo.mjs there): the deep-blue version, and the pearl one when the
 * system is in dark mode. At 32 px and below the simplified one, whose strokes still read.
 */
import deep from '../../assets/brand/etesian-deep.svg';
import pearl from '../../assets/brand/etesian-pearl.svg';
import deepSmall from '../../assets/brand/etesian-favicon.svg';
import pearlSmall from '../../assets/brand/etesian-favicon-pearl.svg';
withDefaults(defineProps<{ size?: number }>(), { size: 24 });
</script>
<template>
  <picture class="etesian-mark">
    <source media="(prefers-color-scheme: dark)" :srcset="size <= 32 ? pearlSmall : pearl">
    <img :src="size <= 32 ? deepSmall : deep" :width="size" :height="size" alt="" aria-hidden="true">
  </picture>
</template>
<style>
.etesian-mark, .etesian-mark img { flex: none; display: block; }
</style>
