<template>
  <q-layout view="hHr LpR fFf">
    <q-header>
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

        <q-toolbar-title> Github Asset Community </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <template v-if="authDataStore.activeToken">
      <q-drawer v-model="leftDrawerOpen">
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
import { matTune } from '@quasar/extras/material-icons';
import LeftDrawer from 'src/components/LeftDrawer.vue';
import { useQuasar } from 'quasar';

const quasar = useQuasar();
const authDataStore = useAuthDataStore();

const leftDrawerOpen = ref(!quasar.platform.is.mobile);
</script>
