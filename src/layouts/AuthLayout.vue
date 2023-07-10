<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="text-h2">认证Github授权中...</div>
    </div>
    <div>
      <q-spinner color="white" size="5rem" :thickness="10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTokenInfo } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';

const authDataStore = useAuthDataStore();
const route = useRoute();
const router = useRouter();

const quasar = useQuasar();

getTokenInfo(route.query.code as string)
  .then((token) => {
    authDataStore.updateToken(token);
    router.push({ name: 'home' });
  })
  .catch(() => {
    myLogger.debug('get token info fail, route to login.');
    quasar.notify({
      type: 'warning',
      message: '获取 Github Token失败!',
      icon: matPriorityHigh,
    });
    router.push({ name: 'login' });
  });
</script>
