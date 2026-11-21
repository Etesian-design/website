<script setup lang="ts">
/** Numbered steps; text in `backticks` is shown as code. */
defineProps<{ items: string[] }>();
const parts = (s: string) => s.split('`').map((t, i) => ({ t, code: i % 2 === 1 }));
</script>
<template>
  <ol class="blk-steps__l">
    <li v-for="(s, i) in items" :key="i"><template v-for="(p, j) in parts(s)" :key="j"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></li>
  </ol>
</template>
