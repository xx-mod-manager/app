<template>
  <RouterView />
</template>

<script setup lang="ts">
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { myLogger } from './boot/logger';
import { ROUTE_HOME, ROUTE_LOGIN } from './router';
import { useAuthDataStore } from './stores/AuthData';

const router = useRouter();
const authDataStore = useAuthDataStore();
const quasar = useQuasar();

if (window.electronApi !== undefined) {
  window.electronApi.onElectronLog((event) => {
    const prefix = event.caller
      ? `(ELEC)[${event.level.toUpperCase()}] [${event.caller.fileName}:${
          event.caller.functionName
        }:${event.caller.lineNumber}]`
      : `[${event.level.toUpperCase()}]`;
    switch (event.level) {
      case 'debug':
        console.debug(prefix, ...event.argumentArray);
        break;
      case 'info':
        console.info(prefix, ...event.argumentArray);
        break;
      case 'warn':
        console.warn(prefix, ...event.argumentArray);
        break;
      case 'error':
        console.error(prefix, ...event.argumentArray);
        break;
      case 'log':
        console.log(prefix, ...event.argumentArray);
        break;
    }
  });
}

router.beforeResolve((to) => {
  if (to.meta.requireLogin) {
    if (!authDataStore.isLogin) {
      myLogger.info(`Route ${to.name?.toString()} require login.`);
      return { name: ROUTE_LOGIN };
    }
  } else if (to.meta.requireNotLogin) {
    if (authDataStore.isLogin) {
      myLogger.info(`Route ${to.name?.toString()} require not login.`);
      return { name: ROUTE_HOME };
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
