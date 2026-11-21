<script setup lang="ts">
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import type { Block } from '../../content/schema';
import { useRouter } from 'vue-router';
import { useNav, go } from '../../lib/nav';
import { ref, useId } from 'vue';
import StepList from './StepList.vue';
import '../common/Disclosure.vue'; // its open/close styles
defineProps<{ block: Extract<Block, { type: 'hero' }>; first?: boolean }>();
const nav = useNav();
const router = useRouter();
/** steps behind a button that sits with the other actions; they open under the row */
const open = ref(false);
const panel = useId();
</script>
<template>
  <header class="blk-hero" :class="{ disc: block.steps, 'is-open': open }">
    <p v-if="block.eyebrow" class="doc__eyebrow">{{ block.eyebrow }}</p>
    <component :is="first ? 'h1' : 'h2'" class="doc__title"><a v-if="block.more" class="doc__more" :href="block.more.href" :title="block.more.label">{{ block.title }} <span aria-hidden="true">›</span></a><template v-else>{{ block.title }}</template></component>
    <p v-if="block.lead" class="doc__lead">{{ block.lead }}</p>
    <div v-if="block.actions?.length || block.steps" class="doc__actions">
      <HdButton v-for="a in block.actions" :key="a.label" :variant="a.primary ? 'accent' : 'default'" :icon="a.icon" @click="go(nav, a.target, router)">{{ a.label }}</HdButton>
      <HdButton v-if="block.steps" class="disc__btn" icon="chevron-down" :aria-expanded="open ? 'true' : 'false'" :aria-controls="panel" @click="open = !open">{{ block.button ?? 'Show the steps' }}</HdButton>
    </div>
    <div v-if="block.steps" :id="panel" class="disc__body" role="region" :aria-label="block.button ?? 'Show the steps'" :inert="!open || undefined"><div class="disc__in"><p v-if="block.intro">{{ block.intro }}</p><StepList :items="block.steps" /></div></div>
  </header>
</template>
<style>.doc__more { color: inherit; text-decoration: none; } .doc__more span { color: var(--hd-accent); } .doc__more:hover, .doc__more:focus-visible { text-decoration: underline; }</style>
