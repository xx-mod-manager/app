<template>
  <q-badge color="secondary"
    >{{ asset.downloadCount }}<q-icon :name="matDownload" color="white"
  /></q-badge>

  <q-badge color="secondary" :label="asset.category" />

  <q-badge color="secondary" :label="asset.author" />

  <q-badge color="secondary" :label="asset.repo" />
</template>

<script setup lang="ts">
import { matDownload } from '@quasar/extras/material-icons';
import { Asset } from 'src/class/Types';

defineProps<{ asset: Asset }>();
</script>

<style>
.q-badge {
  margin-left: 0.3rem;
}
</style>
