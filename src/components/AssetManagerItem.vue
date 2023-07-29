<template>
  <q-card style="margin-bottom: 0.3rem">
    <q-card-section class="row">
      <div>
        <router-link
          v-if="asset.existOnline"
          :to="{ name: ROUTE_ASSET, params: { id: asset.id } }"
        >
          <span class="text-h6 ellipsis-3-lines">{{ asset.name }}</span>
        </router-link>

        <span v-else class="text-h6 ellipsis-3-lines">{{ asset.name }}</span>
      </div>

      <q-space />

      <div>
        <q-btn label="卸载" :disable="!installed" @click="uninstallAsset" />
        <q-btn label="删除" @click="deleteAsset" />

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
        v-for="version in versions"
        :key="version.version"
        class="col-12 row"
        style="margin-top: 0.2rem; padding: 0.5rem"
      >
        <div class="text-subtitle1 ellipsis-3-lines">{{ version.version }}</div>

        <q-space />

        <div>
          <q-btn
            label="安装"
            :disable="version.status != AssetStatus.DOWNLOADED"
            @click="installVersion(version.version)"
          />

          <q-btn
            label="卸载"
            :disable="version.status != AssetStatus.INTALLED"
            @click="uninstallVersion(version.version)"
          />

          <q-btn label="删除" @click="deleteVersion(version.version)" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { matExpandLess, matExpandMore } from '@quasar/extras/material-icons';
import { myLogger } from 'src/boot/logger';
import { Asset, AssetStatus } from 'src/class/Types';
import { ROUTE_ASSET } from 'src/router';
import { useMainDataStore } from 'src/stores/MainData';
import { computed, ref } from 'vue';

const mainDataStore = useMainDataStore();
const props = defineProps<{
  asset: Asset;
}>();
const expand = ref(false);
const versions = computed(() => {
  const result = [] as { version: string; status: AssetStatus }[];
  props.asset.versions.forEach((status, version) => {
    if (status != AssetStatus.NONE) result.push({ version, status });
  });
  return result;
});
const installed = computed(() => {
  for (const version of props.asset.versions) {
    if (version[1] == AssetStatus.INTALLED) return true;
  }
  return false;
});

async function deleteVersion(version: string) {
  const oldStatus = props.asset.versions.get(version);
  if (oldStatus == AssetStatus.INTALLED) {
    uninstallVersion(version);
  } else if (oldStatus == AssetStatus.NONE) {
    throw Error(`${props.asset.id}/${version} is not download or install.`);
  }
  await window.electronApi.deleteAssetVersion(props.asset.id, version);
  mainDataStore.updateAssetVersion(props.asset.id, version, AssetStatus.NONE);
}

async function deleteAsset() {
  for (const i of props.asset.versions)
    if (i[1] != AssetStatus.NONE) deleteVersion(i[0]);
}

async function installVersion(version: string) {
  const oldStatus = props.asset.versions.get(version);
  if (oldStatus == AssetStatus.NONE) {
    throw Error(`${props.asset.id}/${version} is not download.`);
  } else if (oldStatus == AssetStatus.INTALLED) {
    myLogger.warn(`${props.asset.id}/${version} is already installed.`);
  } else {
    await window.electronApi.installAssetVersion(props.asset.id, version);
    mainDataStore.updateAssetVersion(
      props.asset.id,
      version,
      AssetStatus.INTALLED
    );
  }
}

async function uninstallVersion(version: string) {
  const oldStatus = props.asset.versions.get(version);
  if (oldStatus != AssetStatus.INTALLED) {
    throw Error(`${props.asset.id}/${version} is not install.`);
  }
  await window.electronApi.uninstallAssetVersion(props.asset.id, version);
  mainDataStore.updateAssetVersion(
    props.asset.id,
    version,
    AssetStatus.DOWNLOADED
  );
}

async function uninstallAsset() {
  for (const i of props.asset.versions)
    if (i[1] == AssetStatus.INTALLED) uninstallVersion(i[0]);
}
</script>
