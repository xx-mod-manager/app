<template>
  <div class="col-12 row wrap justify-start items-center content-start">
    <a :key="asset.downloadUrl" :href="asset.downloadUrl">
      {{ asset.name }}
    </a>

    <q-badge
      >{{ asset.downloadCount }}<q-icon :name="matDownload" color="white"
    /></q-badge>

    <span style="margin-left: 0.5rem">{{ humanStorageSize(asset.size) }}</span>

    <q-space />

    <DateFormatSpan :date="asset.updatedAt" />
  </div>
</template>

<script setup lang="ts">
import { format } from 'quasar';
import { ReleaseAsset } from 'src/class/Types';
import { matDownload } from '@quasar/extras/material-icons';
import DateFormatSpan from './DateFormatSpan.vue';

defineProps<{
  asset: ReleaseAsset;
}>();

const { humanStorageSize } = format;
</script>
