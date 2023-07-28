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

    <q-drawer
      v-model="leftDrawerOpen"
      persistent
      :breakpoint="512"
      :width="256"
    >
      <LeftDrawer />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { matTune } from '@quasar/extras/material-icons';
import LeftDrawer from 'src/components/LeftDrawer.vue';
import { useQuasar } from 'quasar';

const quasar = useQuasar();

const leftDrawerOpen = ref(!quasar.platform.is.mobile);
</script>
