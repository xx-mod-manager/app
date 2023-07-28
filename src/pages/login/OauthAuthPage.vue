<template>
  <div class="text-h2">认证Github授权中...</div>

  <q-space />

  <q-spinner color="white" size="10rem" :thickness="10" />
</template>

<script setup lang="ts">
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import { getTokenInfo } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useRouter } from 'vue-router';

const props = defineProps<{ code: string }>();

const authDataStore = useAuthDataStore();
const router = useRouter();
const quasar = useQuasar();

getTokenInfo(props.code as string)
  .then((token) => {
    authDataStore.update(token);
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
