<template>
  <div class="col-12 row wrap justify-start items-center content-start">
    <q-btn
      color="primary"
      :loading="downloading"
      :percentage="percentage"
      :label="releaseAsset.name"
      :disable="existLocal(releaseAsset.id)"
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
import { parseVersion } from 'src/utils/StringUtils';
import { ref } from 'vue';
import DateFormatSpan from './DateFormatSpan.vue';

const props = defineProps<{
  resourceId: string;
  releaseAsset: ReleaseAsset;
}>();

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const { humanStorageSize } = format;
const version = parseVersion(props.releaseAsset.name);
const downloading = ref(false);
const percentage = ref(0);

function existLocal(assetNodeId: string) {
  return existLocalAsset(
    mainDataStore.getAssetByNodeId(
      userConfigStore.currentGameId,
      props.resourceId,
      assetNodeId
    )
  );
}

function download(url: string) {
  if (window.electronApi != undefined) {
    downloading.value = true;
    window.electronApi.downloadResource(
      url,
      userConfigStore.currentGameId,
      props.resourceId,
      version
    );
    window.electronApi.onDownloadStarted((url) =>
      myLogger.debug(`start download ${url}.`)
    );
    window.electronApi.onDownloadProgress((progress) => {
      myLogger.debug(`url:${progress.url}.\npercentage: ${progress.percent}`);
      percentage.value = progress.percent * 100;
    });
    window.electronApi.onDownloadCompleted((file) => {
      myLogger.debug(
        `complete download ${file.filename}.\npath: ${file.path}.\nurl:${file.url}.`
      );
      const version = parseVersion(file.filename);
      mainDataStore.updateAssetStatus(
        userConfigStore.currentGameId,
        props.resourceId,
        version,
        AssetStatus.DOWNLOADED
      );
      downloading.value = false;
    });
  } else {
    window.open(url, '_blank');
  }
}
</script>
