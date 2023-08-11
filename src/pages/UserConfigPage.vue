<template>
  <q-page style="padding: 0.5rem">
    <q-list bordered separator dense>
      <q-item v-ripple clickable>
        <q-item-section>
          <q-select
            v-model="userConfigStore.currentGameId"
            borderless
            stack-label
            label="游戏"
            :options="Array.from(mainDataStore.games.values())"
            option-label="name"
            option-value="id"
            map-options
            emit-value
          >
          </q-select>
        </q-item-section>
      </q-item>

      <q-item v-ripple clickable @click="selectSteamAppsPath">
        <q-item-section>
          <q-field
            v-model="userConfigStore.steamAppsPath"
            borderless
            stack-label
            label="Steam app安装路径"
          >
            <template #control="props">
              <div>
                {{ props.modelValue }}
              </div>
            </template>
          </q-field>
        </q-item-section>
      </q-item>

      <q-item
        v-if="platform.is.electron"
        v-ripple
        clickable
        @click="selectGameInstallPath"
      >
        <q-item-section>
          <q-field
            v-model="userConfigStore.currentGame.installPath"
            borderless
            stack-label
            label="mod安装路径"
          >
            <template #control="props">
              <div>
                {{ props.modelValue }}
              </div>
            </template>
          </q-field>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { useMainDataStore } from 'src/stores/MainData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { openDialogSelectDirectory } from 'src/utils/DialogUtils';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const { notify, platform } = useQuasar();

async function selectSteamAppsPath() {
  const dir = await openDialogSelectDirectory('请选择mod安装路径');

  if (dir != null) {
    myLogger.debug(
      `Update steam apps path [${userConfigStore.steamAppsPath}]=>[${dir.path}]`
    );
    userConfigStore.steamAppsPath = dir.path;
    userConfigStore.updateGames(Array.from(mainDataStore.games.values()));
  } else {
    notify({
      type: 'warning',
      message: '未获取到文件夹!',
    });
  }
}

async function selectGameInstallPath() {
  const dir = await openDialogSelectDirectory('请选择mod安装路径');

  if (dir != null) {
    userConfigStore.updateCurrentGameInstallPath(dir.path);
  } else {
    notify({
      type: 'warning',
      message: '未获取到文件夹!',
    });
  }
}
</script>
