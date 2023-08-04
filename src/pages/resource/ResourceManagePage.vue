<template>
  <q-pull-to-refresh :icon="matRefresh" @refresh="refresh">
    <q-page
      style="padding: 0.5rem"
      @drop.stop.prevent="dropEvent"
      @dragenter.stop.prevent
      @dragleave.stop.prevent
      @dragover.stop.prevent
    >
      <ResourceLocalItem
        v-for="resource in resources"
        :key="resource.id"
        :resource="resource"
      />

      <q-inner-loading :showing="refreshing" />

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab
          v-model="fabVisibility"
          vertical-actions-align="right"
          color="primary"
          glossy
          :icon="outlinedKeyboardArrowUp"
          :active-icon="outlinedClose"
          direction="up"
        >
          <q-fab-action
            label-position="left"
            color="primary"
            :icon="outlinedFolderCopy"
            label="导入Mod文件夹"
            @click="addLocalAssetByDirectory"
          />

          <q-fab-action
            label-position="left"
            color="primary"
            :icon="outlinedFileCopy"
            label="导入Mod压缩包"
            @click="addLocalAssetByZip"
          />

          <q-fab-action
            label-position="left"
            color="primary"
            :icon="matRefresh"
            label="刷新"
            @click="() => refresh()"
          />
        </q-fab>
      </q-page-sticky>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { matRefresh } from '@quasar/extras/material-icons';
import {
  outlinedClose,
  outlinedFileCopy,
  outlinedFolderCopy,
  outlinedKeyboardArrowUp,
} from '@quasar/extras/material-icons-outlined';
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
const fabVisibility = ref(false);

const resources = computed(() =>
  mainDataStore
    .getGameById(userConfigStore.currentGameId)
    .resources.filter(existLocalResource)
);

async function addLocalAssetByDirectory() {
  myLogger.debug('Selec directory to add local mod.');
  if (window.electronApi !== undefined) {
    const result = await window.electronApi.selectDirectoryAddAsset(
      userConfigStore.currentGameId,
      '选择Mod文件夹'
    );
    if (result !== undefined) {
      mainDataStore.addDownloadAsset(
        userConfigStore.currentGameId,
        result.resource,
        result.assetId
      );
    }
  } else {
    throw Error('Not in Electron');
  }
}

async function addLocalAssetByZip() {
  myLogger.debug('Selec directory to add local mod.');
  if (window.electronApi !== undefined) {
    const result = await window.electronApi.selectZipFileAddAsset(
      userConfigStore.currentGameId,
      '选择Mod压缩包'
    );
    if (result !== undefined) {
      mainDataStore.addDownloadAsset(
        userConfigStore.currentGameId,
        result.resource,
        result.assetId
      );
    }
  } else {
    throw Error('Not in Electron');
  }
}

async function dropEvent(event: DragEvent) {
  if (window.electronApi === undefined) throw Error('Not in Electron.');
  if (event.dataTransfer === null) return;
  const paths: string[] = [];
  for (let index = 0; index < event.dataTransfer.files.length; index++) {
    paths.push(event.dataTransfer.files[index].path);
  }
  myLogger.debug(`Trigger dropEvent ${paths.join('\n\t')}`);
  const assets = await window.electronApi.addAssetsByPaths(
    userConfigStore.currentGameId,
    paths
  );
  for (const asset of assets) {
    mainDataStore.addDownloadAsset(
      userConfigStore.currentGameId,
      asset.resource,
      asset.assetId
    );
  }
}

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
    myLogger.debug('Start sync install download resources.');
    await window.electronApi.formatInstallAndDownloadDir(
      userConfigStore.currentGameInstallPath,
      userConfigStore.currentGameId
    );
    myLogger.debug('Start update installed asset.');
    mainDataStore.updateInstalledAsset(
      userConfigStore.currentGameId,
      await window.electronApi.getInstealledAssets(
        userConfigStore.currentGameInstallPath
      )
    );
  } else {
    myLogger.info(
      'Install path is undefined, skip sync install download resources and update installed asset.'
    );
  }
  mainDataStore.updateDonwloadedAsset(
    userConfigStore.currentGameId,
    await window.electronApi.getDownloadedAssets(userConfigStore.currentGameId)
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
