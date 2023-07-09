<template>
  <div
    style="padding: 0.5rem"
    class="fit row wrap justify-start items-center content-start"
  >
    <q-avatar class="">
      <img :src="mainDataStore.user.avatarUrl" />
    </q-avatar>
    <span class="text-subtitle2" style="padding-left: 1rem">{{
      mainDataStore.user.login
    }}</span>
    <q-space />
    <q-btn flat round :icon="matLogout" @click="mainDataStore.logout()" />
  </div>
</template>

<script setup lang="ts">
import { useMainDataStore } from 'src/stores/MainData';
import { matLogout } from '@quasar/extras/material-icons';

const mainDataStore = useMainDataStore();
</script>
