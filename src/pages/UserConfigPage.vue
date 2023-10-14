<template>
  <q-page style="padding: 0.5rem">
    <q-list bordered separator dense>
      <q-item v-ripple clickable @click="gameSelect?.showPopup()">
        <q-item-section>
          <QSelect
            ref="gameSelect"
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
          </QSelect>
        </q-item-section>
      </q-item>

      <q-item v-ripple clickable @click="selectSteamAppsPath">
        <q-item-section>
          <q-field
            v-model="userConfigStore.steamAppsPath"
            borderless
            class="cursor-pointer"
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
            class="cursor-pointer"
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

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        :icon="matAdd"
        color="primary"
        label="添加新游戏"
        @click="openAddNewGame"
      />
    </q-page-sticky>

    <q-dialog v-model="addNewGameDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">添加新游戏</div>
          <q-input
            v-model="newGameId"
            label="游戏id"
            :rules="[
              (value) => validateNewGameId(value) || '请输入有效且不重复的值.',
            ]"
          />

          <q-input
            v-model="newGameName"
            label="游戏名称"
            :rules="[
              (value) =>
                validateNewGameName(value) || '请输入有效且不重复的值.',
            ]"
          />

          <div @click="selectNewGameInstallPath">
            <q-field
              v-model="newGameInstallPath"
              class="cursor-pointer"
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
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="取消" color="primary" />
          <q-btn flat label="确定" color="primary" @click="addNewGame" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { matAdd } from '@quasar/extras/material-icons';
import { QSelect, useQuasar } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { Game } from 'src/class/Game';
import { GameConfig } from 'src/class/GameConfig';
import { useMainDataStore } from 'src/stores/MainData';
import { useTempDataStore } from 'src/stores/TempData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { openDialogSelectDirectory } from 'src/utils/DialogUtils';
import { ref } from 'vue';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const { platform, notify } = useQuasar();
const addNewGameDialog = ref(false);
const newGameId = ref(undefined as string | undefined);
const newGameName = ref(undefined as string | undefined);
const newGameInstallPath = ref(undefined as string | undefined);

async function selectSteamAppsPath() {
  const dir = await openDialogSelectDirectory('请选择mod安装路径');

  if (dir != null) {
    myLogger.debug(
      `Update steam apps path [${userConfigStore.steamAppsPath}]=>[${dir.path}]`
    );
    userConfigStore.steamAppsPath = dir.path;
    userConfigStore.updateGames(Array.from(mainDataStore.games.values()));
  } else {
    myLogger.debug('Files is empty');
  }
}

async function selectGameInstallPath() {
  const dir = await openDialogSelectDirectory('请选择mod安装路径');

  if (dir != null) {
    userConfigStore.updateCurrentGameInstallPath(dir.path);
  } else {
    myLogger.debug('Files is empty');
  }
}

function validateNewGameId(value: undefined | string): boolean {
  myLogger.debug('start validateNewGameId');
  if (value == null || value.length === 0) {
    return false;
  }
  if (mainDataStore.games.has(value)) {
    return false;
  }
  return true;
}

function validateNewGameName(value: undefined | string): boolean {
  if (value == null || value.length === 0) {
    return false;
  }
  if (
    Array.from(mainDataStore.games.values()).find((it) => it.name === value) !=
    null
  ) {
    return false;
  }
  return true;
}

async function selectNewGameInstallPath() {
  const dir = await openDialogSelectDirectory('请选择mod安装路径');

  if (dir != null) {
    newGameInstallPath.value = dir.path;
  } else {
    myLogger.debug('Files is empty');
  }
}

function openAddNewGame() {
  addNewGameDialog.value = true;
  newGameId.value = undefined;
  newGameName.value = undefined;
  newGameInstallPath.value = undefined;
}

function addNewGame() {
  //TODO: validate and add userConfig refactor.
  if (
    newGameId.value == null ||
    newGameName.value == null ||
    newGameInstallPath.value == null
  ) {
    notify({
      type: 'warning',
      message: '请填写所有必填字段!',
    });
    return;
  }
  const newGame = Game.byLocalGame(newGameId.value, newGameName.value);
  mainDataStore.games.set(newGame.id, newGame);
  userConfigStore.updateGames([newGame]);
  useTempDataStore().initLocalGames([newGame]);
  const newGameConfig = new GameConfig({
    id: newGame.id,
    installPath: newGameInstallPath.value,
  });
  userConfigStore.gameConfigs.set(newGameConfig.id, newGameConfig);
  addNewGameDialog.value = false;
}

const gameSelect = ref(null as QSelect | null);
</script>
