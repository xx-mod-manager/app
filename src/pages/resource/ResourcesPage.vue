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
import { requestGameResources } from 'src/api/MetaDataApi';
import { myLogger } from 'src/boot/logger';
import ResourceOnlineItem from 'src/components/ResourceOnlineItem.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { useTempDataStore } from 'src/stores/TempData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { computed, onMounted, ref } from 'vue';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const tempDataStore = useTempDataStore();
const refreshing = ref(false);

const resources = computed(
  () =>
    mainDataStore.getOptionGameById(userConfigStore.currentGameId)?.resources ??
    []
);
const searchText = ref('');

const fuse = new Fuse(
  Array.from(resources.value.values()).filter((it) => it.isOnline()),
  {
    keys: ['name', 'description'],
  }
);

const result = computed(() =>
  searchText.value.length > 0
    ? fuse.search(searchText.value).map((it) => it.item)
    : Array.from(resources.value.values()).filter((it) => it.isOnline())
);

async function refresh(done?: () => void) {
  if (refreshing.value) {
    myLogger.warn('Multiple refresh resources.');
    if (done) done();
    return;
  }
  myLogger.debug('Start refresh resources.');
  if (!refreshing.value) refreshing.value = true;
  const dataRepo = mainDataStore.currentGame.dataRepo;
  const onlineResources =
    dataRepo != undefined ? await requestGameResources(dataRepo) : [];
  mainDataStore.currentGame.updateApiResources(onlineResources);
  tempDataStore.updateResources(userConfigStore.currentGameId);
  if (refreshing.value) refreshing.value = false;
  if (done) done();
}

onMounted(() => {
  if (tempDataStore.needRefreshResources(userConfigStore.currentGameId)) {
    refresh();
  }
});
</script>
