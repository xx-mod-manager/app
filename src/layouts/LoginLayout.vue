<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div
      v-if="!(authDataStore.activeToken || authDataStore.activeRefreshToken)"
    >
      <div class="text-h2">授权Github登陆</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        label="授权Github"
        no-caps
        @click="authGithub()"
      />
    </div>

    <div v-else>
      <div class="text-h2">已登陆</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="首页"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthDataStore } from 'src/stores/AuthData';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';

const authDataStore = useAuthDataStore();
const quasar = useQuasar();

authDataStore.refreshToken().catch(() => {
  quasar.notify({
    type: 'warning',
    message: '刷新Github Token失败!',
    icon: matPriorityHigh,
  });
  authDataStore.clearAuthInfo();
});

function authGithub() {
  quasar.loading.show({ message: '跳转Github授权页面...', delay: 400 });
  window.open(
    'https://github.com/login/oauth/authorize?client_id=Iv1.23bebc2931676eb7',
    '_self'
  );
}
</script>
