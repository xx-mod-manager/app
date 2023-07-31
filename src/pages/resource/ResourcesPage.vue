<template>
  <q-pull-to-refresh :icon="matRefresh" @refresh="refresh">
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

      <q-inner-loading :showing="refreshing" />
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { matRefresh } from '@quasar/extras/material-icons';
import Fuse from 'fuse.js';
import { requestGameResources, requestGames } from 'src/api/MetaDataApi';
import { myLogger } from 'src/boot/logger';
import ResourceOnlineItem from 'src/components/ResourceOnlineItem.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { useOnlineDataStore } from 'src/stores/OnlineData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { computed, onMounted, ref } from 'vue';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const onlineDataStore = useOnlineDataStore();
const refreshing = ref(false);

const resources = computed(
  () => mainDataStore.getGameById(userConfigStore.currentGameId).resources
);
const searchText = ref('');

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

async function refresh(done?: () => void) {
  if (refreshing.value) {
    myLogger.warn('Multiple refresh games and resources.');
    if (done) done();
    return;
  }
  myLogger.debug('Start refresh games and resources.');
  if (!refreshing.value) refreshing.value = true;
  const onlineGames = await requestGames();
  mainDataStore.updateOnlineGames(onlineGames);
  userConfigStore.updateOnlineGames(onlineGames);
  onlineDataStore.updateOnlineGames(onlineGames);
  const game = mainDataStore.getGameById(userConfigStore.currentGameId);
  const onlineResources = await requestGameResources(game.dataRepo);
  mainDataStore.updateOnlineResources(
    userConfigStore.currentGameId,
    onlineResources
  );
  onlineDataStore.updateResources(userConfigStore.currentGameId);
  if (refreshing.value) refreshing.value = false;
  if (done) done();
}

onMounted(() => {
  if (
    onlineDataStore.needRefreshGames() ||
    onlineDataStore.needRefreshResources(userConfigStore.currentGameId)
  ) {
    refresh();
  }
});
</script>
