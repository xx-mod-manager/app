<template>
  <q-pull-to-refresh :icon="matRefresh" @refresh="refresh">
    <q-page style="padding: 0.5rem">
      <ResourceLocalItem
        v-for="resource in resources"
        :key="resource.id"
        :resource="resource"
      />

      <q-inner-loading :showing="refreshing" />
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { matRefresh } from '@quasar/extras/material-icons';
import { myLogger } from 'src/boot/logger';
import ResourceLocalItem from 'src/components/ResourceLocalItem.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { useTempDataStore } from 'src/stores/TempData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { existLocalResource } from 'src/utils/ResourceUtils';
import { computed, onMounted, ref } from 'vue';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const tempDataStore = useTempDataStore();
const refreshing = ref(false);

const resources = computed(() =>
  mainDataStore
    .getGameById(userConfigStore.currentGameId)
    .resources.filter(existLocalResource)
);

async function refresh(done?: () => void) {
  if (refreshing.value) {
    myLogger.warn('Multiple refresh resource manage.');
    if (done) done();
    return;
  }
  if (window.electronApi == undefined) {
    myLogger.error('No in electron.');
    if (done) done();
    return;
  }
  myLogger.debug('Start refresh resource manage.');
  refreshing.value = true;
  if (userConfigStore.currentGameInstallPath !== undefined) {
    myLogger.debug('Start syncInstallDownloadResource.');
    await window.electronApi.syncInstallDownloadResource(
      userConfigStore.currentGameInstallPath,
      userConfigStore.currentGameId
    );
    myLogger.debug('Start updateInstalledAsset.');
    mainDataStore.updateInstalledAsset(
      userConfigStore.currentGameId,
      await window.electronApi.initInstealledResources(
        userConfigStore.currentGameInstallPath
      )
    );
  } else {
    myLogger.warn(
      'Install path is undefined, miss syncInstallDownloadResource and updateInstalledAsset.'
    );
  }
  mainDataStore.updateDonwloadedAsset(
    userConfigStore.currentGameId,
    await window.electronApi.initDownloadedResources(
      userConfigStore.currentGameId
    )
  );
  tempDataStore.updateResourceManage(userConfigStore.currentGameId);
  refreshing.value = false;
  if (done) done();
}

onMounted(() => {
  if (tempDataStore.needRefreshResourceManage(userConfigStore.currentGameId)) {
    refresh();
  }
});
</script>
