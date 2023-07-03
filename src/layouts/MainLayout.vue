<template>
  <q-layout v-if="!needAuth" view="hHr LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title> Quasar App </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <p>左侧边栏</p>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-drawer side="right" bordered show-if-above>
      <p>右侧边栏</p>
    </q-drawer>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthDataStore } from 'src/stores/AuthData';
import { ref } from 'vue';

const authDataStore = useAuthDataStore();
const leftDrawerOpen = ref(false);
const needAuth = ref(false);

if (!authDataStore.activeToken) {
  authDataStore.authGithub();
}
</script>
