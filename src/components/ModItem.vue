<template>
  <q-card flat bordered @click="clickMod()">
    <q-card-section>
      <span class="text-subtitle2">{{ mod.name }}</span>
      <ModBadgesSpan :mod="mod" />
    </q-card-section>
    <q-separator inset />
    <q-card-section class="text-body2">{{ mod.description }}</q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Mod } from 'src/class/Mod';
import { useRouter } from 'vue-router';
import ModBadgesSpan from './ModBadgesSpan.vue';

const router = useRouter();
const props = defineProps<{
  mod: Mod;
}>();

function clickMod() {
  router.push({ name: 'asset', params: { id: props.mod.mod_id } });
}
</script>
