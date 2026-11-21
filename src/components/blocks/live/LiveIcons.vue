<script setup lang="ts">
import { ref } from 'vue';
import HdAppIcon from '@etesian-design/vue/components/HdAppIcon.vue';
import HdSwitch from '@etesian-design/vue/components/HdSwitch.vue';
const lit = ref(true);
const apps: [string, string, string][] = [['Phone', 'phone', '#62B700'], ['Messages', 'message', '#09A7CC'], ['Contacts', 'person', '#007DC9'], ['Mail', 'mail', '#0067BC'], ['Calendar', 'calendar', '#EF5500'], ['Settings', 'settings', '#505050']];
</script>
<template>
  <div class="live-col">
    <div class="li"><HdAppIcon v-for="a in apps" :key="a[0]" :label="a[0]" :icon="a[1]" :color="a[2]" :size="64" :lighting="lit ? 'lit' : 'flat'" /></div>
    <HdSwitch v-model="lit" label="N9 lighting" />
  </div>
</template>
<style>.li { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; justify-items: center; }</style>
