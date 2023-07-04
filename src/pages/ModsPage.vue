<template>
  <q-pull-to-refresh @refresh="refresh" ref="pullRefresh">
    <q-page
      class="fit row wrap justify-start items-start content-start"
      style="padding-left: 0.3rem; padding-right: 0.3rem"
    >
      <mod-item
        class="col-12"
        style="margin-top: 0.4rem"
        v-for="mod in mainDataStore.mods"
        :key="mod.id"
        :mod="mod"
      />
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { QPullToRefresh } from 'quasar';
import { myLogger } from 'src/boot/logger';
import ModItem from 'src/components/ModItem.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { onMounted, ref } from 'vue';

const mainDataStore = useMainDataStore();

function refresh(done: () => void) {
  mainDataStore.updateData().finally(done);
}

const pullRefresh = ref(null as QPullToRefresh | null);

onMounted(() => {
  if (pullRefresh.value) {
    myLogger.log('init update main data');
    pullRefresh.value.trigger();
  }
});
</script>
