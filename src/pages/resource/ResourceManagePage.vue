<template>
  <q-pull-to-refresh :icon="matRefresh" @refresh="refresh">
    <q-page
      style="padding: 0.5rem"
      @drop.stop.prevent="dropEvent"
      @dragenter.stop.prevent
      @dragleave.stop.prevent
      @dragover.stop.prevent
    >
      <q-table
        title="资源管理"
        :rows="Array.from(resources.values()).filter((i) => i.isLocal())"
        :columns="columns"
        row-key="id"
        hide-pagination
        :rows-per-page-options="[0]"
        :table-colspan="6"
        :loading="refreshing"
        wrap-cells
      >
        <template #body="props: { row: Resource }">
          <q-tr :props="props" no-hover>
            <q-td key="id" :props="props">
              <div>
                {{ props.row.id }}
              </div>

              <q-badge v-if="props.row.isOnline()" label="在线" />

              <q-popup-edit
                v-slot="scope"
                v-model="props.row.id"
                buttons
                :validate="(v:string) => updateResourceIdValidate(v, props.row)"
                @save="(v:string) => updateResourceId(v, props.row)"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>

            <q-td key="name" :props="props">
              <div>
                {{ props.row.name }}
              </div>

              <q-popup-edit
                v-slot="scope"
                v-model="props.row.name"
                buttons
                :disable="props.row.isOnline()"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>

            <q-td key="description" :props="props">
              <div class="ellipsis-3-lines">
                {{ props.row.description }}
              </div>

              <q-popup-edit
                v-slot="scope"
                v-model="props.row.description"
                buttons
                :disable="props.row.isOnline()"
              >
                <q-input
                  v-model="scope.value"
                  type="textarea"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>

            <q-td key="author" :props="props">
              <div>
                {{ props.row.author }}
              </div>

              <q-popup-edit
                v-slot="scope"
                v-model="props.row.author"
                buttons
                :disable="props.row.isOnline()"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>

            <q-td key="category" :props="props">
              <div>
                {{ props.row.category }}
              </div>

              <q-popup-edit
                v-slot="scope"
                v-model="props.row.category"
                buttons
                :disable="props.row.isOnline()"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>

            <q-td key="action" :props="props">
              <div>
                <q-btn label="删除" @click="resources.delete(props.row.id)" />
              </div>
            </q-td>
          </q-tr>

          <q-tr
            v-for="asset in props.row.assets.values()"
            :key="asset.id"
            :props="props"
            no-hover
          >
            <q-td colspan="5" class="text-center text-weight-thin">
              <div>
                {{ asset.id }}
              </div>

              <q-badge v-if="asset.isOnline()" label="在线" />

              <q-popup-edit
                v-slot="scope"
                v-model="asset.id"
                buttons
                :validate="(v:string) => updateAssetIdValidate(props.row, v)"
                @save="(v:string)=>updateAssetId(props.row,v,asset)"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>

            <q-td class="text-center">
              <q-btn
                flat
                label="删除"
                @click="props.row.deleteAsset(asset.id)"
              />
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="text-left">请通过导入按钮或拖动zip,文件夹来导入Mod。</div>
        </template>
      </q-table>

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
import { Asset } from 'src/class/Asset';
import { Resource } from 'src/class/Resource';
import { ImportAssetQuery } from 'src/class/Types';
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
const resources = computed(() => mainDataStore.currentGame.resources);

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

function updateAssetIdValidate(resource: Resource, newAssetId: string) {
  const conflict = resource.hasAsset(newAssetId);
  if (conflict) {
    myLogger.info(`AssetId conflict, [${resource.id}] exist [${newAssetId}]`);
    notifyAssetIdConflict(resource.name, newAssetId);
  }
  return !conflict;
}

function updateAssetId(
  resource: Resource,
  newAssetId: string,
  oldAsset: Asset
) {
  resource.deleteAsset(oldAsset.id);
  const newImpAsset = new Asset({ ...oldAsset, id: newAssetId });
  resource.addAsset(newImpAsset);
}

function updateResourceIdValidate(
  newResourceId: string,
  oldResource: Resource
) {
  const existResource = resources.value.get(newResourceId);
  if (existResource != undefined) {
    for (const oldAsset of oldResource.assets.values()) {
      if (existResource.hasAsset(oldAsset.id)) {
        myLogger.info(
          `AssetId conflict, [${existResource.id}] exist [${oldAsset.id}]`
        );
        notifyAssetIdConflict(existResource.name, oldAsset.id);
        return false;
      }
    }
  }
  return true;
}

function updateResourceId(newResourceId: string, oldResource: Resource) {
  resources.value.delete(oldResource.id);

  const existResource = resources.value.get(newResourceId);

  if (existResource != undefined) {
    existResource.addAssets(oldResource.assets.values());
  } else {
    const newImpResource = new Resource({
      ...oldResource,
      id: newResourceId,
    });
    newImpResource.addAssets(oldResource.assets.values());
    resources.value.set(newImpResource.id, newImpResource);
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

function notifyAssetIdConflict(resourceName: string, assetId: string) {
  notify({
    type: 'warning',
    message: `版本冲突，[${resourceName}]已有版本[${assetId}]`,
  });
}

const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left' as const,
    headerStyle: 'width: 20%',
  },
  {
    name: 'name',
    label: '名字',
    field: 'name',
    align: 'left' as const,
    headerStyle: 'width: 20%',
  },
  {
    name: 'description',
    label: '描述',
    field: 'description',
    align: 'left' as const,
    headerStyle: 'width: 25%',
  },
  {
    name: 'author',
    label: '作者',
    field: 'author',
    align: 'left' as const,
    headerStyle: 'width: 10%',
  },
  {
    name: 'category',
    label: '分类',
    field: 'category',
    align: 'left' as const,
    headerStyle: 'width: 10%',
  },
  {
    name: 'action',
    label: '操作',
    field: 'id',
    align: 'center' as const,
    headerStyle: 'width: 15%',
  },
];
</script>

<style>
table {
  table-layout: fixed;
}
</style>
