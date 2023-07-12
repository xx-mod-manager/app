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

        <q-tabs inline-label class="bg-primary text-white">
          <q-route-tab
            name="asset"
            :icon="matDownload"
            label="资源"
            :to="{ name: 'assets' }"
          />
          <q-route-tab
            name="assetManager"
            :icon="matWidgets"
            label="管理资源"
            :to="{ name: 'assetManager' }"
          />
        </q-tabs>

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

      <q-drawer v-model="rightDrawerOpen" side="right" bordered>
        <p>右侧边栏，计划显示分类的列表</p>
      </q-drawer>
    </template>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthDataStore } from 'src/stores/AuthData';
import { ref } from 'vue';
import {
  matTune,
  matMenu,
  matDownload,
  matWidgets,
} from '@quasar/extras/material-icons';
import LeftDrawer from 'src/components/LeftDrawer.vue';
import { useQuasar } from 'quasar';

const quasar = useQuasar();
const authDataStore = useAuthDataStore();

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
</script>
