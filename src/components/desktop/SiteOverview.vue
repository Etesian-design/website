<script setup lang="ts">
/**
 * The Overview, the desktop's main menu (design repo XOverview: Desktop v1's Overview, kept by Desktop v2), with the site's
 * content: the Events view on the left, the open windows in the middle (two per row, as in XOverview), the app grid with type-to-search on the right.
 * The dock's first button and Super open it; Super+Space is the compact search (XLauncher) next to it.
 */
import HdSearchField from '@etesian/components/HdSearchField.vue';
import XAppsView from '@etesian/stories/explorations/parts/XAppsView.vue';
import XHints from '@etesian/stories/explorations/desktop/XHints.vue';
import '@etesian/stories/explorations/parts/XOverview.vue';
import SiteEventsPanel from './SiteEventsPanel.vue';
import SiteWindows, { type OverviewWin } from './SiteWindows.vue';
defineProps<{ wins: OverviewWin[]; selected: number; query: string; width: number; height: number }>();
const emit = defineEmits<{ 'update:selected': [i: number]; 'update:query': [q: string]; focus: [key: string]; open: [name: string]; close: [] }>();
/** XOverview's columns: Events 420 px, apps 600 px, the windows in between */
const SIDES = 420 + 600;
</script>
<template>
  <div class="x-ov hd-on-home site-ov" role="dialog" aria-label="Overview">
    <aside class="x-ov__events"><SiteEventsPanel /></aside>
    <section class="x-ov__wins" aria-label="Open windows">
      <SiteWindows bare :wins="wins" :level="2" :selected="selected" :left="0" :width="width - SIDES" :height="height"
        @update:selected="(i: number) => emit('update:selected', i)" @open="(k: string) => emit('focus', k)" @close="emit('close')">
        <template #preview="{ win }"><slot name="preview" :win="win" /></template>
      </SiteWindows>
    </section>
    <section class="x-ov__apps" aria-label="Applications">
      <HdSearchField :model-value="query" placeholder="Type to search apps, contacts, mail" label="Search" @update:model-value="(v: string) => emit('update:query', v)" />
      <p class="x-ov__hint">{{ query ? `Apps matching “${query}”` : 'Just start typing' }}</p>
      <XAppsView :columns="5" :size="54" :query="query" @open="(n: string) => emit('open', n)" />
    </section>
    <XHints corner="br" :items="[['Esc', 'Close'], ['Enter', 'Open'], ['Super+Space', 'Spotlight']]" />
  </div>
</template>
<style>
.site-ov .x-ov__wins { position: relative; padding: 0; }
.site-ov .x-ov__wins .x-wins { background: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
</style>
