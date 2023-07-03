<template>
  <q-page class="row justify-evenly">
    <q-pull-to-refresh @refresh="refresh" ref="pull">
      <q-list>
        <mod-item v-for="mod in mainDataStore.mods" :key="mod.id" :mod="mod" />
      </q-list>
    </q-pull-to-refresh>
  </q-page>
</template>

<script setup lang="ts">
import { QPullToRefresh } from 'quasar';
import ModItem from 'src/components/ModItem.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { useAuthDataStore } from 'src/stores/AuthData';
import { onMounted, ref } from 'vue';
import { myLogger } from 'src/boot/logger';

const mainDataStore = useMainDataStore();
const authDataStore = useAuthDataStore();
let sum = 0;
if (!authDataStore.activeToken) {
  myLogger.debug('active token auth ', sum);
  if (sum == 0) {
    window.open(
      'https://github.com/login/oauth/authorize?client_id=Iv1.23bebc2931676eb7',
      // 'https://baidu.com',
      '_self'
    );
    sum++;
  }
}
function refresh(done: () => void) {
  mainDataStore.updateData().finally(done);
}

const pull = ref<QPullToRefresh | null>(null);
onMounted(() => {
  pull.value?.trigger();
});
</script>
