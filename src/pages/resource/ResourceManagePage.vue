<template>
  <q-page style="padding: 0.5rem">
    <ResourceLocalItem
      v-for="resource in resources"
      :key="resource.id"
      :resource="resource"
    />
  </q-page>
</template>

<script setup lang="ts">
import ResourceLocalItem from 'src/components/ResourceLocalItem.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { existLocalResource } from 'src/utils/ResourceUtils';
import { computed } from 'vue';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();

const resources = computed(
  () =>
    mainDataStore
      .getGameById(userConfigStore.game)
      ?.resources.filter(existLocalResource) ?? []
);
</script>
