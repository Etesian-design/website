<script setup lang="ts">
/** The same controls twice: Quasar's own components with the @etesian-design/quasar theme, and the library's Hd* components. */
import { ref, onMounted } from 'vue';
const ready = ref(false); onMounted(() => { ready.value = true; }); // Quasar's buttons take classes from the browser's platform and QInput makes random ids: drawn in the browser only
import { QBtn, QToggle, QInput } from 'quasar';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import HdSwitch from '@etesian-design/vue/components/HdSwitch.vue';
import HdTextField from '@etesian-design/vue/components/HdTextField.vue';
const a = ref(true), b = ref(true), t1 = ref('Anna'), t2 = ref('Anna');
</script>
<template>
  <div class="lq">
    <div class="live-col"><span class="live-lbl">Quasar, Etesian theme</span><template v-if="ready"><div class="live-row"><QBtn unelevated color="primary" label="Accept" /><QBtn unelevated label="Cancel" /></div><QToggle v-model="a" label="WLAN" /><QInput v-model="t1" label="Name" /></template></div>
    <div class="live-col"><span class="live-lbl">@etesian-design/vue</span><div class="live-row"><HdButton variant="accent">Accept</HdButton><HdButton>Cancel</HdButton></div><HdSwitch v-model="b" label="WLAN" /><HdTextField v-model="t2" label="Name" /></div>
  </div>
</template>
<style>.lq { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }</style>
