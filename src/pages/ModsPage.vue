<template>
  <QPullToRefresh ref="pullRefresh" :icon="matRefresh" @refresh="refresh">
    <q-page
      class="fit row wrap justify-start items-start content-start"
      style="padding-left: 0.3rem; padding-right: 0.3rem"
    >
      <ModItem
        v-for="mod in mainDataStore.mods"
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
import { onMounted, ref } from 'vue';
import { matRefresh } from '@quasar/extras/material-icons';

const mainDataStore = useMainDataStore();
const { loading } = useQuasar();

function refresh(done: () => void) {
  myLogger.debug('refresh main data');
  mainDataStore.updateData().finally(() => {
    if (loading.isActive) loading.hide();
    done();
  });
}

const pullRefresh = ref(null as QPullToRefresh | null);

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
