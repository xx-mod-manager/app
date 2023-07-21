<template>
  <div>
    <div id="userInfoDiv" class="row justify-start items-center content-start">
      <q-avatar>
        <img :src="mainDataStore.user.avatarUrl" />
      </q-avatar>

      <span class="text-subtitle1" style="padding-left: 1rem">{{
        mainDataStore.user.login
      }}</span>

      <q-space />

      <q-btn flat round :icon="matLogout" @click="logout" />
    </div>

    <q-tabs inline-label vertical>
      <q-route-tab
        name="asset"
        :icon="matDownload"
        label="首页"
        :to="{ name: 'assets' }"
      />
      <q-route-tab
        v-if="quasar.platform.is.electron"
        name="assetManager"
        :icon="matWidgets"
        label="资源管理"
        :to="{ name: 'assetManager' }"
      />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { useMainDataStore } from 'src/stores/MainData';
import {
  matLogout,
  matDownload,
  matWidgets,
} from '@quasar/extras/material-icons';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const mainDataStore = useMainDataStore();
const authDataStore = useAuthDataStore();
const router = useRouter();
const quasar = useQuasar();

function logout() {
  authDataStore.clearAuthInfo();
  router.push({ name: 'login' });
}
</script>

<style lang="scss">
div #userInfoDiv {
  padding: 0.5rem;
  background-color: $primary;
  color: white;
}
</style>
