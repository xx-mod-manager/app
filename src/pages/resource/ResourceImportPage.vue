<template>
  <q-page
    style="padding: 0.5rem"
    @drop.stop.prevent="dropEvent"
    @dragenter.stop.prevent
    @dragleave.stop.prevent
    @dragover.stop.prevent
  >
    <q-table
      title="等待导入..."
      :rows="Array.from(impResources.values())"
      :columns="columns"
      row-key="id"
      hide-pagination
      :rows-per-page-options="[0]"
      :table-colspan="6"
      wrap-cells
    >
      <template #body="props: { row: ImpResource }">
        <q-tr :props="props" no-hover>
          <q-td key="id" :props="props">
            <div>
              {{ props.row.id }}
            </div>

            <q-badge v-if="isImpResourceExist(props.row.id)" label="已存在" />

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
              :disable="isImpResourceExist(props.row.id)"
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
              :disable="isImpResourceExist(props.row.id)"
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
              :disable="isImpResourceExist(props.row.id)"
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
              :disable="isImpResourceExist(props.row.id)"
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
              <q-btn label="删除" @click="impResources.delete(props.row.id)" />
            </div>
          </q-td>
        </q-tr>

        <q-tr
          v-for="asset in props.row.assets.values()"
          :key="asset.id"
          :props="props"
          no-hover
        >
          <q-td colspan="1" class="text-center text-weight-thin">
            <div>
              {{ asset.id }}
            </div>

            <q-badge
              v-if="isImpAssetExist(props.row.id, asset.id)"
              label="已存在"
            />

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

          <q-td colspan="4" class="text-left text-weight-thin text-italic">
            <div
              class="ellipsis-3-lines cursor-pointer"
              @click="openPath(asset.path)"
            >
              {{ asset.path }}
            </div>
          </q-td>

          <q-td class="text-center">
            <q-btn
              flat
              label="删除"
              @click="deleteAsset(props.row, asset.id)"
            />
          </q-td>
        </q-tr>
      </template>

      <template #no-data>
        <div class="text-left">请通过导入按钮或拖动zip,文件夹来导入Mod。</div>
      </template>
    </q-table>

    <q-checkbox v-model="rmRaw" label="删除原文件" />

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        :icon="outlinedClose"
        color="accent"
        style="margin-right: 1rem"
        :to="{ name: ROUTE_HOME }"
      />

      <q-btn
        fab
        :icon="outlinedDone"
        color="secondary"
        style="margin-right: 1rem"
        @click="done"
      />

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
          :icon="outlinedClose"
          label="清空全部"
          @click="clearAll"
        />

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
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { matPriorityHigh } from '@quasar/extras/material-icons';
import {
  outlinedClose,
  outlinedDone,
  outlinedFileCopy,
  outlinedFolderCopy,
  outlinedKeyboardArrowUp,
} from '@quasar/extras/material-icons-outlined';
import { useQuasar } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { ImpAsset, ImpResource } from 'src/class/imp';
import { ROUTE_HOME } from 'src/router';
import { useMainDataStore } from 'src/stores/MainData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { notNull } from 'src/utils/CommentUtils';
import {
  openDialogSelectDirectory,
  openDialogSelectZipFile,
} from 'src/utils/DialogUtils';
import {
  importLocalAssetByDirPath,
  importLocalAssetByZipPath,
} from 'src/utils/ResourceFsUtils';
import { parseResourceAndVersion } from 'src/utils/StringUtils';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const { notify, loading } = useQuasar();
const { push: routerPush } = useRouter();
const impResources = ref(new Map<string, ImpResource>());
const fabVisibility = ref(false);
const rmRaw = ref(false);

function clearAll() {
  impResources.value.clear();
}

async function addLocalAssetByDirectory() {
  myLogger.debug('Selec directory to add asset.');
  const dir = await openDialogSelectDirectory('选择Mod文件夹');
  if (dir != undefined) {
    const info = parseResourceAndVersion(dir.name);
    addImportAsset(info.resourceId, info.assetId, dir.path, 'dir');
  } else {
    notify({
      type: 'warning',
      message: '未获取到文件夹!',
      icon: matPriorityHigh,
    });
  }
}

async function addLocalAssetByZip() {
  myLogger.debug('Selec Zip to add asset.');
  const file = await openDialogSelectZipFile('选择Mod压缩包');
  if (file != undefined) {
    const info = parseResourceAndVersion(file.name);
    addImportAsset(info.resourceId, info.assetId, file.path, 'zip');
  } else {
    notify({
      type: 'warning',
      message: '未获取到Zip!',
      icon: matPriorityHigh,
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

  pathInfos.forEach((pathInfo) => {
    if ((pathInfo.isFile && '.zip' === pathInfo.ext) || pathInfo.isDirectory) {
      const info = parseResourceAndVersion(pathInfo.name);
      addImportAsset(
        info.resourceId,
        info.assetId,
        pathInfo.path,
        pathInfo.isDirectory ? 'dir' : 'zip'
      );
    } else {
      myLogger.info(`Path ${pathInfo.path} is not zip and is not dir.`);
      notify({
        type: 'warning',
        message: `[${pathInfo.path}] 不是文件夹, 也不是Zip文件。`,
        icon: matPriorityHigh,
      });
    }
  });
}

async function done() {
  myLogger.info('Start done import.');
  loading.show({ message: '操作中', delay: 400 });

  await Promise.all(
    Array.from(impResources.value.values())
      .flatMap((i) =>
        Array.from(i.assets.values()).map((j) => {
          return {
            resourceId: i.id,
            assertId: j.id,
            path: j.path,
            type: j.type,
          };
        })
      )
      .map(async (info) => {
        if (info.type === 'dir') {
          await importLocalAssetByDirPath(
            userConfigStore.currentGameId,
            info.resourceId,
            info.assertId,
            info.path,
            rmRaw.value
          );
        } else {
          await importLocalAssetByZipPath(
            userConfigStore.currentGameId,
            info.resourceId,
            info.assertId,
            info.path,
            rmRaw.value
          );
        }
      })
  );
  for (const impResource of impResources.value.values()) {
    mainDataStore.addImpResource(userConfigStore.currentGameId, impResource);
  }

  loading.hide();
  routerPush({ name: ROUTE_HOME });
}

function openPath(path: string) {
  notNull(window.electronApi, 'ElectronApi').shell.showItemInFolder(path);
}

function deleteAsset(resource: ImpResource, assetId: string) {
  resource.deleteAsset(assetId);
  if (resource.assets.size === 0) impResources.value.delete(resource.id);
}

function updateAssetIdValidate(
  impResource: ImpResource,
  newImpAssetId: string
) {
  const conflict = impResource.hasAsset(newImpAssetId);
  if (conflict) {
    myLogger.info(
      `AssetId conflict, [${impResource.id}] exist [${newImpAssetId}]`
    );
    notifyAssetIdConflict(impResource.name, newImpAssetId);
  }
  return conflict;
}

function updateAssetId(
  impResource: ImpResource,
  newImpAssetId: string,
  oldImpAsset: ImpAsset
) {
  impResource.deleteAsset(oldImpAsset.id);
  const newImpAsset = new ImpAsset({ ...oldImpAsset, id: newImpAssetId });
  impResource.addAsset(newImpAsset);
}

function updateResourceIdValidate(
  newImportResourceId: string,
  oldImportResource: ImpResource
) {
  const existImportResource = impResources.value.get(newImportResourceId);
  if (existImportResource != undefined) {
    for (const oldImportasset of oldImportResource.assets.values()) {
      if (existImportResource.hasAsset(oldImportasset.id)) {
        myLogger.info(
          `AssetId conflict, [${existImportResource.id}] exist [${oldImportasset.id}]`
        );
        notifyAssetIdConflict(existImportResource.name, oldImportasset.id);
        return false;
      }
    }
  }
  return true;
}

function updateResourceId(
  newImpResourceId: string,
  oldImpResource: ImpResource
) {
  impResources.value.delete(oldImpResource.id);

  const existImportResource = impResources.value.get(newImpResourceId);
  const existResource = mainDataStore.getOptionResourceById(
    userConfigStore.currentGameId,
    newImpResourceId
  );

  if (existImportResource != undefined) {
    existImportResource.addAssets(oldImpResource.assets.values());
  } else {
    // const newImpResource = ImpResource.newById(newImportResourceId);
    const newImpResource = new ImpResource({
      ...oldImpResource,
      id: newImpResourceId,
    });
    newImpResource.addAssets(oldImpResource.assets.values());
    if (existResource != undefined) newImpResource.update(existResource);
    impResources.value.set(newImpResource.id, newImpResource);
  }
}

function isImpAssetExist(impResourceId: string, impAssetId: string): boolean {
  return (
    mainDataStore.getOptionAssetById(
      userConfigStore.currentGameId,
      impResourceId,
      impAssetId
    ) != undefined
  );
}

function isImpResourceExist(impResourceId: string): boolean {
  return (
    mainDataStore.getOptionResourceById(
      userConfigStore.currentGameId,
      impResourceId
    ) != undefined
  );
}

function addImportAsset(
  impResourceId: string,
  importAssetId: string,
  path: string,
  type: 'dir' | 'zip'
) {
  myLogger.debug(
    `Start add import asset:[${impResourceId}][${importAssetId}][${path}].`
  );
  const existImportResource = impResources.value.get(impResourceId);
  const existResource = mainDataStore.getOptionResourceById(
    userConfigStore.currentGameId,
    impResourceId
  );
  if (existImportResource == undefined) {
    const impResource = ImpResource.newById(impResourceId);
    impResource.addAsset({ id: importAssetId, path, type });
    if (existResource != undefined) impResource.update(existResource);
    impResources.value.set(impResource.id, impResource);
  } else {
    if (existImportResource.hasAsset(importAssetId)) {
      myLogger.info(
        `Improt duplicate asset [${impResourceId}]/[${importAssetId}]`
      );
      notifyAssetIdConflict(existImportResource.name, importAssetId);
    } else {
      existImportResource.addAsset({ id: importAssetId, path, type });
    }
  }
}

function notifyAssetIdConflict(resourceName: string, assetId: string) {
  notify({
    type: 'warning',
    message: `版本冲突，[${resourceName}]已有版本[${assetId}]`,
    icon: matPriorityHigh,
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
