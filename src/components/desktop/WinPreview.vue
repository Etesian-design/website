<script setup lang="ts">
/** A live, inert copy of an open window at its own size, for the Overview, the windows switcher and the dock's hover preview. */
import XMiniApp from '@etesian/stories/explorations/parts/XMiniApp.vue';
import XFit from '@etesian/stories/explorations/parts/XFit.vue';
import PhoneUI from '../phone/PhoneUI.vue';
import PageRenderer from '../blocks/PageRenderer.vue';
import { doc, type DocId } from '../../content/site';
defineProps<{ win: { key: string; title: string }; idPrefix: string }>();
</script>
<template>
  <div class="site-prevbar hd-on-chrome">{{ win.title }}</div>
  <div class="site-prevbody hd-on-page">
    <XMiniApp v-if="win.key.startsWith('app:')" :name="win.title" chrome="none" density="pointer" :hints="false" :id-prefix="`${idPrefix}-${win.title}`" />
    <div v-else-if="win.key.startsWith('phone:')" class="site-prevphone"><XFit :w="360" :h="720" fit="contain"><PhoneUI embedded /></XFit></div>
    <PageRenderer v-else :page="doc(win.key.slice(4) as DocId)" />
  </div>
</template>
