<template>
  <QPullToRefresh ref="pullRefresh" :icon="matRefresh" @refresh="refresh">
    <q-page>
      <div
        class="row wrap justify-start items-stretch content-start"
        style="padding-left: 0.3rem; padding-right: 0.3rem"
      >
        <AssetListItem
          v-for="asset in result"
          :key="asset.id"
          style="margin: 0.2rem; width: 20rem"
          :asset="asset"
        />
      </div>
    </q-page>
  </QPullToRefresh>
</template>

<script setup lang="ts">
import { QPullToRefresh, useQuasar } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { useMainDataStore } from 'src/stores/MainData';
import { computed, onMounted, ref } from 'vue';
import { matRefresh } from '@quasar/extras/material-icons';
import Fuse from 'fuse.js';
import { useAuthDataStore } from 'src/stores/AuthData';
import AssetListItem from 'src/components/AssetListItem.vue';

const mainDataStore = useMainDataStore();
const authDataStore = useAuthDataStore();
const { loading } = useQuasar();

const searchText = ref('');
const pullRefresh = ref(null as QPullToRefresh | null);

const fuse = new Fuse(mainDataStore.assets, {
  keys: ['name', 'description'],
});

const result = computed(() =>
  searchText.value.length > 0
    ? fuse.search(searchText.value).map((it) => it.item)
    : mainDataStore.assets
);

function refresh(done: () => void) {
  myLogger.debug('refresh main data');
  mainDataStore.refresh().finally(() => {
    if (loading.isActive) loading.hide();
    done();
  });
}

onMounted(() => {
  if (
    pullRefresh.value &&
    (mainDataStore.assets.length == 0 || authDataStore.user == undefined)
  ) {
    loading.show();
    pullRefresh.value.trigger();
  }
});
</script>
