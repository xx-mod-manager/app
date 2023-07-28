<template>
  <q-page style="padding: 0.5rem">
    <template v-for="asset in mainDataStore.assets" :key="asset.id">
      <AssetManagerItem v-if="existLocal(asset)" :asset="asset" />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import AssetManagerItem from 'src/components/AssetManagerItem.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { existLocal } from 'src/utils/AssetUtils';

const mainDataStore = useMainDataStore();
</script>
