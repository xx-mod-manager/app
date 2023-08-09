<template>
  <q-layout view="hHr LpR fFf">
    <q-header>
      <q-toolbar>
        <q-btn
          v-if="quasar.platform.is.mobile"
          flat
          dense
          round
          :icon="matTune"
          aria-label="Settings"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title> XX Mod Manager </q-toolbar-title>

        <div>v{{ version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      persistent
      :breakpoint="512"
      :width="256"
    >
      <LeftDrawer />
    </q-drawer>

    <q-page-container>
      <router-view v-if="initEnd" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { matTune } from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import { requestGames } from 'src/api/MetaDataApi';
import { myLogger } from 'src/boot/logger';
import LeftDrawer from 'src/components/LeftDrawer.vue';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useMainDataStore } from 'src/stores/MainData';
import { useTempDataStore } from 'src/stores/TempData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { getDefaultSteamAppsPath } from 'src/utils/ResourceFsUtils';
import { onMounted, ref } from 'vue';
import { version } from '../../package.json';

const quasar = useQuasar();
const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const tempDataStore = useTempDataStore();
const authDataStore = useAuthDataStore();
const leftDrawerOpen = ref(!quasar.platform.is.mobile);
const initEnd = ref(false);

if (!navigator.onLine) {
  myLogger.info('To offline status.');
  tempDataStore.online = false;
}

async function refresh() {
  myLogger.debug('Start refresh games.');
  try {
    if (tempDataStore.online && authDataStore.isLogin) {
      const onlineGames = await requestGames();
      mainDataStore.updateByApiGames(onlineGames);
      tempDataStore.updateApiGames(onlineGames);
      await userConfigStore.updateApiGames(onlineGames);
    } else {
      myLogger.info(
        `Skip refresh online games, online:[${tempDataStore.online}], isLogin:[${authDataStore.isLogin}]`
      );
    }
  } catch (error) {
    myLogger.error(error);
  } finally {
    myLogger.debug('End refresh games.');
    if (quasar.loading.isActive) quasar.loading.hide();
    initEnd.value = true;
  }
}

onMounted(async () => {
  if (userConfigStore.steamAppsPath == null)
    userConfigStore.steamAppsPath = await getDefaultSteamAppsPath();

  const oldGames = Array.from(mainDataStore.games.values());
  await userConfigStore.updateGames(oldGames);
  tempDataStore.initLocalGames(oldGames);

  if (tempDataStore.needRefreshGames()) await refresh();
  else initEnd.value = true;
});
</script>
