<template>
  <q-layout view="hHr LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          :icon="matTune"
          aria-label="Settings"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title> Quasar App </q-toolbar-title>
        <q-space />
        <q-btn
          flat
          dense
          round
          :icon="matMenu"
          aria-label="Menu"
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </q-toolbar>
    </q-header>

    <template v-if="authDataStore.activeToken">
      <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
        <LeftDrawer />
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>

      <q-drawer v-model="rightDrawerOpen" side="right" bordered show-if-above>
        <p>右侧边栏，计划显示分类的列表</p>
      </q-drawer>
    </template>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthDataStore } from 'src/stores/AuthData';
import { ref } from 'vue';
import { matTune, matMenu } from '@quasar/extras/material-icons';
import LeftDrawer from 'src/components/LeftDrawer.vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { matPriorityHigh } from '@quasar/extras/material-icons';

const quasar = useQuasar();
const authDataStore = useAuthDataStore();
const router = useRouter();
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

if (!authDataStore.activeToken) {
  if (authDataStore.activeRefreshToken) {
    myLogger.debug('need refresh token, start.');
    authDataStore.refreshToken().catch(() => {
      myLogger.debug('refresh token fail, route to login.');
      quasar.notify({
        type: 'warning',
        message: '刷新Github Token失败!',
        icon: matPriorityHigh,
      });
      authDataStore.clearAuthInfo();
      router.push({ name: 'login' });
    });
  } else {
    myLogger.debug('need auth, route to login.');
    router.push({ name: 'login' });
  }
}
</script>
