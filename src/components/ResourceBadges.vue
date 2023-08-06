<template>
  <div>
    <q-badge
      >{{ resource.downloadCount }}<q-icon :name="matDownload" color="white"
    /></q-badge>

    <q-badge :label="resource.category" />

    <q-badge :label="resource.author" />

    <q-badge :label="resource.repo" />

    <q-badge v-for="tag in resource.tags" :key="tag" :label="tag" />
  </div>
</template>

<script setup lang="ts">
import { matDownload } from '@quasar/extras/material-icons';
import { Resource } from 'src/class/Resource';

defineProps<{ resource: Resource }>();
</script>

<style>
.q-badge {
  margin-left: 0.3rem;
}
</style>
