<template>
  <span>
    <q-badge
      >{{ mod.downloadCount }}<q-icon :name="matDownload" color="white"
    /></q-badge>
    <q-badge color="accent" label="作者 todo" />
    <q-badge color="secondary" label="分类 todo" />
    <q-badge color="info" :label="props.mod.repo" />
  </span>
</template>

<script setup lang="ts">
import { Mod } from 'src/class/Mod';
import { matDownload } from '@quasar/extras/material-icons';

const props = defineProps<{
  mod: Mod;
}>();
</script>

<style>
.q-badge {
  margin-left: 0.3rem;
}
</style>
