<template>
  <q-item>
    <q-item-section>
      <q-item-label>{{ props.mod.name }}</q-item-label>
      <q-item-label caption>{{ props.mod.description }}</q-item-label>
    </q-item-section>
  </q-item>
</template>
<script setup lang="ts">
import { Mod } from 'src/class/Mod';

const props = defineProps<{
  mod: Mod;
}>();
</script>
