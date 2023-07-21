<template>
  <q-layout view="hHr LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="quasar.platform.is.mobile"
          flat
          dense
          round
          :icon="matTune"
          aria-label="Settings"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <q-tabs
          v-if="quasar.platform.is.electron"
          inline-label
          class="bg-primary text-white"
        >
          <q-route-tab
            name="asset"
            :icon="matDownload"
            label="资源"
            :to="{ name: 'assets' }"
          />
          <q-route-tab
            v-if="quasar.platform.is.electron"
            name="assetManager"
            :icon="matWidgets"
            label="管理资源"
            :to="{ name: 'assetManager' }"
          />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <template v-if="authDataStore.activeToken">
      <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
        <LeftDrawer />
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>
    </template>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthDataStore } from 'src/stores/AuthData';
import { ref } from 'vue';
import {
  matTune,
  matDownload,
  matWidgets,
} from '@quasar/extras/material-icons';
import LeftDrawer from 'src/components/LeftDrawer.vue';
import { useQuasar } from 'quasar';

const quasar = useQuasar();
const authDataStore = useAuthDataStore();

const leftDrawerOpen = ref(false);
</script>
