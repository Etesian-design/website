<script setup lang="ts">
/**
 * A button that shows or hides a section below it (closed by default). The content is always in the page, so the
 * generated HTML and no-JS visitors have it open (html.js closes it); it opens and closes with the design tokens'
 * motion, and at once with reduced motion.
 */
import { ref, useId } from 'vue';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
defineProps<{ label: string }>();
const open = ref(false);
const id = `disc-${useId()}`;
</script>
<template>
  <div class="disc" :class="{ 'is-open': open }">
    <HdButton class="disc__btn" icon="chevron-down" :aria-expanded="open ? 'true' : 'false'" :aria-controls="id" @click="open = !open">{{ label }}</HdButton>
    <div :id="id" class="disc__body" role="region" :aria-label="label" :inert="!open || undefined"><div class="disc__in"><slot /></div></div>
  </div>
</template>
<style>
.disc__btn .hd-icon { transition: transform var(--hd-motion-duration-default) var(--hd-motion-easing-in-out); }
.disc.is-open .disc__btn .hd-icon { transform: rotate(180deg); }
.disc__body { display: grid; grid-template-rows: 1fr; transition: grid-template-rows var(--hd-motion-duration-default) var(--hd-motion-easing-in-out), opacity var(--hd-motion-duration-default) var(--hd-motion-easing-in-out); }
.disc__in { overflow: hidden; min-height: 0; }
html.js .disc:not(.is-open) .disc__body { grid-template-rows: 0fr; opacity: 0; }
.disc.is-open .disc__in { padding-top: 12px; }
@media (prefers-reduced-motion: reduce) { .disc__body, .disc__btn .hd-icon { transition: none; } }
</style>
