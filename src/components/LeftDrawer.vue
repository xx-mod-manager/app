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

    <q-btn flat round :icon="matLogout" @click="logout" />

    <q-list class="col-12" style="margin-top: 1rem">
      <q-item clickable @click="goHome">
        <q-item-section class="text-center">首页</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { useMainDataStore } from 'src/stores/MainData';
import { matLogout } from '@quasar/extras/material-icons';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useRouter } from 'vue-router';

const mainDataStore = useMainDataStore();
const authDataStore = useAuthDataStore();
const router = useRouter();

function logout() {
  authDataStore.clearAuthInfo();
  router.push({ name: 'login' });
}

function goHome() {
  router.push({ name: 'home' });
}
</script>
