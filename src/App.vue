<script setup lang="ts">
/** App root: one Etesian colour-mode scope (hybrid, the N9 default) and the font chosen from the design repo's free alternatives. */
import HdTheme from '@etesian/components/HdTheme.vue';
import { siteFont } from './lib/font';
import { useMeta } from 'quasar';
/* defaults for every generated page; each page sets its own title and description over them (lib/meta.ts) */
useMeta({ title: 'Etesian', meta: { description: { name: 'description', content: 'Etesian: a calm, gesture-first design language inspired by the Nokia N9, for an Android phone and the KDE Plasma desktop.' } } });
</script>
<template>
  <HdTheme mode="hybrid" class="site-root" :style="siteFont">
    <router-view />
  </HdTheme>
</template>
<style>
.site-root { min-height: 100%; height: 100%; }
</style>
