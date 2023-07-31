<template>
  <q-card style="margin-bottom: 0.3rem">
    <q-card-section class="row">
      <div>
        <router-link
          v-if="resource.existOnline"
          :to="{ name: ROUTE_RESOURCE, params: { id: resource.id } }"
        >
          <span class="text-h6 ellipsis-3-lines">{{ resource.name }}</span>
        </router-link>

        <span v-else class="text-h6 ellipsis-3-lines">{{ resource.name }}</span>
      </div>

      <q-space />

      <div>
        <q-btn label="卸载" :disable="!installed" @click="uninstallResource" />
        <q-btn label="删除" @click="deleteResource" />

        <q-btn
          flat
          :icon="expand ? matExpandLess : matExpandMore"
          @click="expand = !expand"
        />
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-section v-if="expand">
      <div
        v-for="asset in assets"
        :key="asset.id"
        class="col-12 row"
        style="margin-top: 0.2rem; padding: 0.5rem"
      >
        <div class="text-subtitle1 ellipsis-3-lines">{{ asset.id }}</div>

        <q-space />

        <div>
          <q-btn
            label="安装"
            :disable="asset.status != AssetStatus.DOWNLOADED"
            @click="installAsset(asset.id)"
          />

          <q-btn
            label="卸载"
            :disable="asset.status != AssetStatus.INTALLED"
            @click="uninstallAsset(asset.id)"
          />

          <q-btn label="删除" @click="deleteAsset(asset.id)" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { matExpandLess, matExpandMore } from '@quasar/extras/material-icons';
import { myLogger } from 'src/boot/logger';
import { AssetStatus, Resource } from 'src/class/Types';
import { ROUTE_RESOURCE } from 'src/router';
import { useMainDataStore } from 'src/stores/MainData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { existLocalAsset, existOnlineAsset } from 'src/utils/AssetUtils';
import { computed, ref } from 'vue';
//TODO download btn
const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const props = defineProps<{
  resource: Resource;
}>();
const expand = ref(false);
const assets = computed(() => {
  return props.resource.assets.filter(existLocalAsset);
});
const installed = computed(() => {
  for (const asset of props.resource.assets) {
    if (asset.status == AssetStatus.INTALLED) return true;
  }
  return false;
});

async function deleteAsset(assetId: string) {
  const asset = mainDataStore.getAssetById(
    userConfigStore.currentGameId,
    props.resource.id,
    assetId
  );
  if (asset.status == AssetStatus.INTALLED) {
    uninstallAsset(assetId);
  } else if (asset.status == AssetStatus.NONE) {
    throw Error(`${props.resource.id}/${assetId} is not download or install.`);
  }
  await window.electronApi.deleteAsset(
    userConfigStore.currentGameId,
    props.resource.id,
    assetId
  );
  if (existOnlineAsset(asset)) {
    mainDataStore.updateAssetStatus(
      userConfigStore.currentGameId,
      props.resource.id,
      assetId,
      AssetStatus.NONE
    );
  } else {
    mainDataStore.deleteAssetById(
      userConfigStore.currentGameId,
      props.resource.id,
      assetId
    );
  }
}

async function deleteResource() {
  for (const asset of props.resource.assets)
    if (asset.status != AssetStatus.NONE) deleteAsset(asset.id);
}

async function installAsset(assetId: string) {
  const oldStatus = props.resource.assets.find((i) => i.id == assetId)?.status;
  if (oldStatus == AssetStatus.NONE) {
    throw Error(`${props.resource.id}/${assetId} is not download.`);
  } else if (oldStatus == AssetStatus.INTALLED) {
    myLogger.warn(`${props.resource.id}/${assetId} is already installed.`);
  } else {
    await window.electronApi.installAsset(
      userConfigStore.currentGameId,
      props.resource.id,
      assetId
    );
    mainDataStore.updateAssetStatus(
      userConfigStore.currentGameId,
      props.resource.id,
      assetId,
      AssetStatus.INTALLED
    );
  }
}

async function uninstallAsset(assetId: string) {
  const oldStatus = props.resource.assets.find((i) => i.id == assetId)?.status;
  if (oldStatus != AssetStatus.INTALLED) {
    throw Error(`${props.resource.id}/${assetId} is not install.`);
  }
  await window.electronApi.uninstallAsset(props.resource.id, assetId);
  mainDataStore.updateAssetStatus(
    userConfigStore.currentGameId,
    props.resource.id,
    assetId,
    AssetStatus.DOWNLOADED
  );
}

async function uninstallResource() {
  for (const i of props.resource.assets)
    if (i.status == AssetStatus.INTALLED) uninstallAsset(i.id);
}
</script>
