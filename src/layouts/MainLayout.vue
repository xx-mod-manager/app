<template>
  <q-layout v-if="!needAuth" view="hHr LpR fFf">
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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <LeftDrawer />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-drawer v-model="rightDrawerOpen" side="right" bordered show-if-above>
      <p>右侧边栏，计划显示分类的列表</p>
    </q-drawer>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthDataStore } from 'src/stores/AuthData';
import { ref } from 'vue';
import { matTune, matMenu } from '@quasar/extras/material-icons';
import LeftDrawer from 'src/components/LeftDrawer.vue';

const authDataStore = useAuthDataStore();
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const needAuth = ref(false);

if (!authDataStore.activeToken) {
  needAuth.value = true;
  authDataStore.authGithub();
}
</script>
