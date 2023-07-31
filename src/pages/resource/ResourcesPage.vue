<template>
  <QPullToRefresh ref="pullRefresh" :icon="matRefresh" @refresh="refresh">
    <q-page>
      <div
        class="row wrap justify-start items-stretch content-start"
        style="padding-left: 0.3rem; padding-right: 0.3rem"
      >
        <ResourceOnlineItem
          v-for="resource in result"
          :key="resource.id"
          style="margin: 0.2rem; width: 20rem"
          :resource="resource"
        />
      </div>
    </q-page>
  </QPullToRefresh>
</template>

<script setup lang="ts">
import { matRefresh } from '@quasar/extras/material-icons';
import Fuse from 'fuse.js';
import { QPullToRefresh, useQuasar } from 'quasar';
import { requestGameResources, requestGames } from 'src/api/MetaDataApi';
import { myLogger } from 'src/boot/logger';
import ResourceOnlineItem from 'src/components/ResourceOnlineItem.vue';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useMainDataStore } from 'src/stores/MainData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { computed, onMounted, ref } from 'vue';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const authDataStore = useAuthDataStore();
const { loading, platform } = useQuasar();

const resources = computed(
  () =>
    mainDataStore.getGameById(userConfigStore.currentGameId)?.resources ?? []
);
const searchText = ref('');
const pullRefresh = ref(null as QPullToRefresh | null);

const fuse = new Fuse(
  resources.value.filter((it) => it.existOnline),
  {
    keys: ['name', 'description'],
  }
);

const result = computed(() =>
  searchText.value.length > 0
    ? fuse.search(searchText.value).map((it) => it.item)
    : resources.value.filter((it) => it.existOnline)
);

async function refresh(done: () => void) {
  myLogger.debug('refresh main data');
  const onlineGames = await requestGames();
  mainDataStore.updateOnlineGames(onlineGames);
  userConfigStore.updateOnlineGames(onlineGames);
  //TODO default game process
  const game = mainDataStore.getGameById(userConfigStore.currentGameId);
  if (game == undefined) throw Error('Current game miss');
  const onlineResources = await requestGameResources(game.dataRepo);
  mainDataStore.updateOnlineResources(
    userConfigStore.currentGameId,
    onlineResources
  );
  if (platform.is.electron) {
    //TODO process miss install path
    if (userConfigStore.currentGameInstallPath == undefined) {
      throw Error('miss install Path');
    }
    await window.electronApi.syncInstallDownloadResource(
      userConfigStore.currentGameInstallPath,
      userConfigStore.currentGameId
    );
    mainDataStore.updateInstalledAsset(
      userConfigStore.currentGameId,
      await window.electronApi.initInstealledResources(
        userConfigStore.currentGameInstallPath
      )
    );
    mainDataStore.updateDonwloadedAsset(
      userConfigStore.currentGameId,
      await window.electronApi.initDownloadedResources(
        userConfigStore.currentGameId
      )
    );
  }
  if (loading.isActive) loading.hide();
  done();
}

onMounted(() => {
  if (
    pullRefresh.value &&
    (resources.value.length == 0 || authDataStore.user == undefined)
  ) {
    loading.show();
    pullRefresh.value.trigger();
  }
});
</script>
