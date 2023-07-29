<template>
  <RouterView />
</template>

<script setup lang="ts">
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { myLogger } from './boot/logger';
import { ROUTE_LOGIN } from './router';
import { useAuthDataStore } from './stores/AuthData';

const router = useRouter();
const authDataStore = useAuthDataStore();
const quasar = useQuasar();

router.beforeResolve((to) => {
  if (to.meta.requiresAuth) {
    if (!authDataStore.isLogin) {
      myLogger.debug('beforeResolve not auth, route to login');
      return { name: 'login' };
    }
  } else if (to.meta.requiresNotAuth) {
    if (authDataStore.isLogin) {
      myLogger.debug('beforeResolve alread auth, route to home');
      return { name: 'home' };
    }
  }
});

router.afterEach(() => {
  if (!authDataStore.activeToken) {
    if (authDataStore.activeRefreshToken) {
      myLogger.debug('need refresh token, start.');
      authDataStore.refreshToken().catch(() => {
        myLogger.debug('refresh token fail, route to login.');
        quasar.notify({
          type: 'warning',
          message: '刷新Github Token失败!',
          icon: matPriorityHigh,
        });
        authDataStore.clear();
        router.push({ name: ROUTE_LOGIN });
      });
    }
  }
});
</script>
