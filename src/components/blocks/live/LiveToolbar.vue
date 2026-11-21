<script setup lang="ts">
import { ref } from 'vue';
import HdToolBar from '@etesian-design/vue/components/HdToolBar.vue';
import HdToolIcon from '@etesian-design/vue/components/HdToolIcon.vue';
import HdPageHeader from '@etesian-design/vue/components/HdPageHeader.vue';
import HdListItem from '@etesian-design/vue/components/HdListItem.vue';
const starred = ref(false);
</script>
<template>
  <div class="ltb">
    <HdPageHeader title="Notes" />
    <div class="ltb__body"><HdListItem title="Shopping" subtitle="Milk, bread, coffee" /><HdListItem title="Ideas" subtitle="A quieter lock screen" /><HdListItem :title="starred ? 'Trip ★' : 'Trip'" subtitle="Tap the star below" /></div>
    <HdToolBar back><HdToolIcon icon="add" label="New note" /><HdToolIcon icon="star" label="Favourite" :active="starred" @click="starred = !starred" /><template #right><HdToolIcon icon="more" label="Menu" /></template></HdToolBar>
  </div>
</template>
<style>
.ltb { display: flex; flex-direction: column; height: 300px; max-width: 360px; margin: 0 auto; border: 1px solid var(--hd-c-divider); }
.ltb__body { flex: 1; overflow: auto; }
</style>
