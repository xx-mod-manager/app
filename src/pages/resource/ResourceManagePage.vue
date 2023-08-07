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
import { useQuasar } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { ImportAssetQuery } from 'src/class/Types';
import ResourceLocalItem from 'src/components/ResourceLocalItem.vue';
import { ROUTE_RESOURCE_IMPORT } from 'src/router/routes';
import { useMainDataStore } from 'src/stores/MainData';
import { useTempDataStore } from 'src/stores/TempData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { notNull } from 'src/utils/CommentUtils';
import {
  openDialogSelectDirectory,
  openDialogSelectZipFile,
} from 'src/utils/DialogUtils';
import { parseResourceAndVersion } from 'src/utils/StringUtils';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const tempDataStore = useTempDataStore();
const { notify } = useQuasar();
const { push } = useRouter();
const refreshing = ref(false);
const fabVisibility = ref(false);

const resources = computed(() =>
  Array.from(
    mainDataStore.getGameById(userConfigStore.currentGameId).resources.values()
  ).filter((it) => it.isLocal())
);

async function addLocalAssetByDirectory() {
  myLogger.debug('Selec directory to add asset.');
  const dir = await openDialogSelectDirectory('选择Mod文件夹');
  if (dir != undefined) {
    const info = parseResourceAndVersion(dir.name);
    push({
      name: ROUTE_RESOURCE_IMPORT,
      query: {
        assets: JSON.stringify({
          dirs: [{ ...info, path: dir.path }],
          zips: [],
        } as ImportAssetQuery),
      },
    });
  } else {
    notify({
      type: 'warning',
      message: '未获取到文件夹!',
    });
  }
}

async function addLocalAssetByZip() {
  myLogger.debug('Selec Zip to add asset.');
  const file = await openDialogSelectZipFile('选择Mod压缩包');
  if (file != undefined) {
    const info = parseResourceAndVersion(file.name);
    push({
      name: ROUTE_RESOURCE_IMPORT,
      query: {
        assets: JSON.stringify({
          dirs: [],
          zips: [{ ...info, path: file.path }],
        } as ImportAssetQuery),
      },
    });
  } else {
    notify({
      type: 'warning',
      message: '未获取到Zip!',
    });
  }
}

async function dropEvent(event: DragEvent) {
  if (event.dataTransfer === null) return;
  myLogger.debug('file size is:', event.dataTransfer.files.length);

  const { fs, path } = notNull(window.electronApi, 'ElectronApi');

  const itemPaths: string[] = [];
  for (let index = 0; index < event.dataTransfer.files.length; index++) {
    itemPaths.push(event.dataTransfer.files[index].path);
  }

  const pathInfos = await Promise.all(
    itemPaths.map(async (itemPath) => {
      //TODO: change to async
      const state = await fs.state(itemPath);
      const name = await path.getBasename(itemPath);
      const ext = await path.extname(itemPath);
      return { ...state, path: itemPath, name, ext };
    })
  );

  const dirs: unknown[] = [];
  const zips: unknown[] = [];
  pathInfos.forEach((pathInfo) => {
    if ((pathInfo.isFile && '.zip' === pathInfo.ext) || pathInfo.isDirectory) {
      const info = parseResourceAndVersion(pathInfo.name);
      if (pathInfo.isDirectory) {
        dirs.push({ ...info, path: pathInfo.path });
      } else {
        zips.push({ ...info, path: pathInfo.path });
      }
    } else {
      myLogger.info(`Path ${pathInfo.path} is not zip and is not dir.`);
      notify({
        type: 'warning',
        message: `[${pathInfo.path}] 不是文件夹, 也不是Zip文件。`,
      });
    }
  });
  myLogger.warn(dirs, zips);
  push({
    name: ROUTE_RESOURCE_IMPORT,
    query: {
      assets: JSON.stringify({
        dirs,
        zips,
      } as ImportAssetQuery),
    },
  });
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
    mainDataStore.currentGame.updateInstalledAsset(
      await window.electronApi.getInstealledAssets(
        userConfigStore.currentGameInstallPath
      )
    );
  } else {
    myLogger.info(
      'Install path is undefined, skip sync install download resources and update installed asset.'
    );
  }
  mainDataStore.currentGame.updateDownloadedAsset(
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
