<template>
  <div class="col-12 row wrap justify-start items-center content-start">
    <q-btn
      color="primary"
      :loading="downloading"
      :percentage="percentage"
      :label="asset.name"
      :disable="downloaded"
      no-caps
      @click="download(asset.downloadUrl)"
    >
      <template #loading>
        <q-spinner-gears class="on-left" />
        下载中...
      </template>
    </q-btn>

    <q-badge
      >{{ asset.downloadCount }}<q-icon :name="matDownload" color="white"
    /></q-badge>

    <span style="margin-left: 0.5rem">{{ humanStorageSize(asset.size) }}</span>

    <q-space />

    <DateFormatSpan :date="asset.updatedAt" />
  </div>
</template>

<script setup lang="ts">
import { matDownload } from '@quasar/extras/material-icons';
import { format, Platform } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { AssetStatus, ReleaseAsset } from 'src/class/Types';
import { useMainDataStore } from 'src/stores/MainData';
import { clearUrlArgs, parseVersion } from 'src/utils/StringUtils';
import { computed, ref } from 'vue';
import DateFormatSpan from './DateFormatSpan.vue';
import { useUserConfigStore } from 'src/stores/UserConfig';

const props = defineProps<{
  assetId: string;
  asset: ReleaseAsset;
}>();

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const { humanStorageSize } = format;
const version = parseVersion(props.asset.name);
const downloading = ref(false);
const percentage = ref(0);
const downloaded = computed(
  () =>
    !!mainDataStore
      .getResourceById(userConfigStore.game, props.assetId)
      ?.assets.find((i) => (i.id = version))?.status
);

function download(url: string) {
  if (Platform.is.electron) {
    downloading.value = true;
    window.electronApi.downloadResource(
      url,
      userConfigStore.game,
      props.assetId,
      version
    );
    window.electronApi.onDownloadStarted((url) =>
      myLogger.debug(`start download ${clearUrlArgs(url)}.`)
    );
    window.electronApi.onDownloadProgress((progress) => {
      myLogger.debug(
        `url:${clearUrlArgs(url)}.\npercentage: ${progress.percent}`
      );
      percentage.value = progress.percent;
    });
    window.electronApi.onDownloadCompleted((file) => {
      myLogger.debug(
        `complete download ${file.filename}.\npath: ${
          file.path
        }.\nurl:${clearUrlArgs(file.url)}.`
      );
      const version = parseVersion(file.filename);
      mainDataStore.updateAssetStatus(
        userConfigStore.game,
        props.assetId,
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
