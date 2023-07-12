<template>
  <QPullToRefresh ref="pullRefresh" :icon="matRefresh" @refresh="refresh">
    <q-page
      class="fit row wrap justify-start items-start content-start"
      style="padding-left: 0.3rem; padding-right: 0.3rem"
    >
      <q-input
        v-model="searchText"
        rounded
        outlined
        class="col-12"
        style="margin-top: 0.4rem"
      >
        <template #append>
          <q-avatar :icon="matSearch" />
        </template>
      </q-input>
      <ModItem
        v-for="mod in result"
        :key="mod.id"
        class="col-12"
        style="margin-top: 0.4rem"
        :mod="mod"
      />
    </q-page>
  </QPullToRefresh>
</template>

<script setup lang="ts">
import { QPullToRefresh, useQuasar } from 'quasar';
import { myLogger } from 'src/boot/logger';
import ModItem from 'src/components/ModItem.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { computed, onMounted, ref } from 'vue';
import { matRefresh, matSearch } from '@quasar/extras/material-icons';
import Fuse from 'fuse.js';

const mainDataStore = useMainDataStore();
const { loading } = useQuasar();
const searchText = ref('');
const pullRefresh = ref(null as QPullToRefresh | null);

const fuse = new Fuse(mainDataStore.mods, {
  keys: ['name', 'description'],
});

const result = computed(() =>
  searchText.value.length > 0
    ? fuse.search(searchText.value).map((it) => it.item)
    : mainDataStore.mods
);

function refresh(done: () => void) {
  myLogger.debug('refresh main data');
  mainDataStore.updateData().finally(() => {
    if (loading.isActive) loading.hide();
    done();
  });
}

onMounted(() => {
  if (
    pullRefresh.value &&
    (mainDataStore.mods.length == 0 || mainDataStore.user.login.length == 0)
  ) {
    loading.show();
    pullRefresh.value.trigger();
  }
});
</script>
