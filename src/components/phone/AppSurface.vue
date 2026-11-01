<script setup lang="ts">
/**
 * One phone app as it appears full screen: a content page (brand-coloured N9 header, the page, the bottom toolbar with Back)
 * or one of the design repo's mock apps (XMiniApp, with its own N9 toolbar).
 */
import { computed } from 'vue';
import HdPageHeader from '@etesian/components/HdPageHeader.vue';
import HdToolBar from '@etesian/components/HdToolBar.vue';
import XMiniApp from '@etesian/stories/explorations/parts/XMiniApp.vue';
import { doc } from '../../content/site';
import PageRenderer from '../blocks/PageRenderer.vue';
import { phoneApp } from '../../lib/phoneApps';
const props = defineProps<{ appKey: string; preview?: boolean }>();
const emit = defineEmits<{ back: [] }>();
const a = computed(() => phoneApp(props.appKey)!);
const d = computed(() => (a.value.doc ? doc(a.value.doc) : undefined));
</script>
<template>
  <div class="ph-surface hd-on-page">
    <template v-if="d">
      <div class="ph-surface__scroll">
        <HdPageHeader :title="d.title" colored :accent="d.color" />
        <PageRenderer :page="d" />
      </div>
      <HdToolBar back @back="emit('back')" />
    </template>
    <XMiniApp v-else :name="a.mock!" chrome="toolbar" :hints="false" :id-prefix="preview ? `pv-${appKey}` : `ph-${appKey}`" />
  </div>
</template>
<style>
.ph-surface { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; background: var(--hd-c-bg); color: var(--hd-c-fg); }
.ph-surface__scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.ph-surface > .x-shell { flex: 1; min-height: 0; }
</style>
