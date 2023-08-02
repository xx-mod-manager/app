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

        <q-toolbar-title> Github Resource Community </q-toolbar-title>
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
import { useMainDataStore } from 'src/stores/MainData';
import { useTempDataStore } from 'src/stores/OnlineData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { onMounted, ref } from 'vue';

const quasar = useQuasar();
const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const tempDataStore = useTempDataStore();
const leftDrawerOpen = ref(!quasar.platform.is.mobile);
const initEnd = ref(false);

userConfigStore.updaetLocalGames(mainDataStore.games);
tempDataStore.initLocalGames(mainDataStore.games);

async function refresh() {
  myLogger.debug('Start refresh games.');
  if (!quasar.loading.isActive) quasar.loading.show();
  try {
    const onlineGames = await requestGames();
    mainDataStore.updateOnlineGames(onlineGames);
    tempDataStore.updateTempGames(onlineGames);
    await userConfigStore.updateOnlineGames(onlineGames);
  } catch (error) {
    tempDataStore.online = false;
    myLogger.warn('To offline status.');
  } finally {
    myLogger.debug('End refresh games.');
    if (quasar.loading.isActive) quasar.loading.hide();
    initEnd.value = true;
  }
}

onMounted(() => {
  if (tempDataStore.needRefreshGames()) {
    refresh();
  }
});
</script>
