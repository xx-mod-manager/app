<template>
  <div class="col-12 row wrap justify-start items-center content-start">
    <q-btn
      color="primary"
      :loading="downloading"
      :percentage="percentage"
      :label="releaseAsset.name"
      :disable="existLocalAssetByNodeId(releaseAsset.id)"
      no-caps
      @click="download(releaseAsset.downloadUrl)"
    >
      <template #loading>
        <q-spinner-gears class="on-left" />
        下载中...
      </template>
    </q-btn>

    <q-badge
      >{{ releaseAsset.downloadCount
      }}<q-icon :name="matDownload" color="white"
    /></q-badge>

    <span style="margin-left: 0.5rem">{{
      humanStorageSize(releaseAsset.size)
    }}</span>

    <q-space />

    <DateFormatSpan :date="releaseAsset.updatedAt" />
  </div>
</template>

<script setup lang="ts">
import { matDownload } from '@quasar/extras/material-icons';
import { format } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { AssetStatus, ReleaseAsset } from 'src/class/Types';
import { useMainDataStore } from 'src/stores/MainData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { existLocalAsset } from 'src/utils/AssetUtils';
import { parseResourceAndVersion } from 'src/utils/StringUtils';
import { ref, toRefs } from 'vue';
import DateFormatSpan from './DateFormatSpan.vue';

const props = defineProps<{
  resourceId: string;
  releaseAsset: ReleaseAsset;
}>();
const { releaseAsset, resourceId } = toRefs(props);

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const { humanStorageSize } = format;
const { assetId } = parseResourceAndVersion(releaseAsset.value.name);
const downloading = ref(false);
const percentage = ref(0);

function existLocalAssetByNodeId(assetNodeId: string) {
  return existLocalAsset(
    mainDataStore.getAssetByNodeId(
      userConfigStore.currentGameId,
      resourceId.value,
      assetNodeId
    )
  );
}

function download(url: string) {
  if (window.electronApi != undefined) {
    downloading.value = true;
    window.electronApi.downloadAndUnzipAsset(
      url,
      userConfigStore.currentGameId,
      resourceId.value,
      assetId
    );
    const oldAssetFullId =
      userConfigStore.currentGameId + '-' + resourceId.value + '-' + assetId;
    window.electronApi.onDownloadStarted((assetFullId) => {
      if (oldAssetFullId !== assetFullId) return;
      myLogger.debug(`Start download ${oldAssetFullId}.`);
    });
    window.electronApi.onDownloadProgress((assetFullId, progress) => {
      if (oldAssetFullId !== assetFullId) return;
      myLogger.debug(`${oldAssetFullId} percentage: ${progress.percent}`);
      percentage.value = progress.percent * 100;
    });
    window.electronApi.onDownloadCompleted((assetFullId, file) => {
      if (oldAssetFullId !== assetFullId) return;
      myLogger.debug(
        `Complete download:[${file.filename}] path:[${file.path}] url:[${file.url}].`
      );
      mainDataStore.updateAssetStatus(
        userConfigStore.currentGameId,
        resourceId.value,
        assetId,
        AssetStatus.DOWNLOADED
      );
      downloading.value = false;
    });
  } else {
    window.open(url, '_blank');
  }
}
</script>
