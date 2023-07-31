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
import { useOnlineDataStore } from 'src/stores/OnlineData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { existLocalResource } from 'src/utils/ResourceUtils';
import { computed, onMounted, ref } from 'vue';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const onlineDataStore = useOnlineDataStore();
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
  myLogger.debug('Start refresh resource manage.');
  refreshing.value = true;
  //TODO process miss install path
  if (userConfigStore.currentGameInstallPath == undefined) {
    throw Error('miss install Path');
  }
  await window.electronApi.syncInstallDownloadResource(
    userConfigStore.currentGameInstallPath,
    userConfigStore.currentGameId
  );
  mainDataStore.updateInstalledAsset(
    userConfigStore.currentGameId,
    await window.electronApi.initInstealledResources(
      userConfigStore.currentGameInstallPath
    )
  );
  mainDataStore.updateDonwloadedAsset(
    userConfigStore.currentGameId,
    await window.electronApi.initDownloadedResources(
      userConfigStore.currentGameId
    )
  );
  onlineDataStore.updateResourceManage(userConfigStore.currentGameId);
  if (refreshing.value) refreshing.value = false;
  if (done) done();
}

onMounted(() => {
  if (
    onlineDataStore.needRefreshResourceManage(userConfigStore.currentGameId)
  ) {
    refresh();
  }
});
</script>
