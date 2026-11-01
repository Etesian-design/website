<script setup lang="ts">
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import type { Block } from '../../content/schema';
import { useRouter } from 'vue-router';
import { useNav, go } from '../../lib/nav';
defineProps<{ block: Extract<Block, { type: 'hero' }>; first?: boolean }>();
const nav = useNav();
const router = useRouter();
</script>
<template>
  <header class="blk-hero">
    <p v-if="block.eyebrow" class="doc__eyebrow">{{ block.eyebrow }}</p>
    <component :is="first ? 'h1' : 'h2'" class="doc__title">{{ block.title }}</component>
    <p v-if="block.lead" class="doc__lead">{{ block.lead }}</p>
    <div v-if="block.actions?.length" class="doc__actions">
      <HdButton v-for="a in block.actions" :key="a.label" :variant="a.primary ? 'accent' : 'default'" :icon="a.icon" @click="go(nav, a.target, router)">{{ a.label }}</HdButton>
    </div>
  </header>
</template>
