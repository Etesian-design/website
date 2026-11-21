<script setup lang="ts">
import { ref } from 'vue';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import HdSwitch from '@etesian-design/vue/components/HdSwitch.vue';
import HdCheckBox from '@etesian-design/vue/components/HdCheckBox.vue';
import HdRadioButton from '@etesian-design/vue/components/HdRadioButton.vue';
import HdTextField from '@etesian-design/vue/components/HdTextField.vue';
import HdSlider from '@etesian-design/vue/components/HdSlider.vue';
const wifi = ref(true), bt = ref(false), chk = ref(true), radio = ref('ring'), text = ref(''), vol = ref(60), seg = ref('day');
</script>
<template>
  <div class="live-col">
    <div class="live-row"><HdButton variant="accent">Accept</HdButton><HdButton>Cancel</HdButton><HdButton variant="negative" icon="delete">Delete</HdButton></div>
    <div class="live-row"><HdButton v-for="s in ['day', 'week', 'month']" :key="s" size="small" :pressed="seg === s" @click="seg = s">{{ s }}</HdButton></div>
    <HdSwitch v-model="wifi" label="WLAN" /><HdSwitch v-model="bt" label="Bluetooth" />
    <HdCheckBox v-model="chk" label="Show in Events" />
    <div class="live-row"><HdRadioButton v-model="radio" value="ring" name="live-prof" label="Ringing" /><HdRadioButton v-model="radio" value="beep" name="live-prof" label="Beep" /><HdRadioButton v-model="radio" value="silent" name="live-prof" label="Silent" /></div>
    <HdTextField v-model="text" label="Name" placeholder="Type here" clearable />
    <HdSlider v-model="vol" label="Volume" />
  </div>
</template>
