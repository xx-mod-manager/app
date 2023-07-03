<template>
  <q-page class="row justify-evenly">
    <q-pull-to-refresh @refresh="refresh">
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
import { useQuasar } from 'quasar';

const quasar = useQuasar();
const mainDataStore = useMainDataStore();
const authDataStore = useAuthDataStore();

if (!authDataStore.activeToken) {
  quasar.loading.show({ message: '跳转Github授权页中...' });
  window.open(
    'https://github.com/login/oauth/authorize?client_id=Iv1.23bebc2931676eb7',
    '_self'
  );
}

function refresh(done: () => void) {
  mainDataStore.updateData().finally(done);
}
</script>
