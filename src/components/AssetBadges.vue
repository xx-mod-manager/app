<template>
  <div>
    <q-badge
      >{{ asset.downloadCount }}<q-icon :name="matDownload" color="white"
    /></q-badge>

    <q-badge :label="asset.category" />

    <q-badge :label="asset.author" />

    <q-badge :label="asset.repo" />

    <q-badge v-for="tag in asset.tags" :key="tag" :label="tag" />
  </div>
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
