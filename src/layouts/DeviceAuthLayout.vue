<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div v-if="deviceCodeInfo">
      <div class="text-h2">验证码</div>
      <div class="text-h2">{{ deviceCodeInfo.user_code }}</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        label="打开Github"
        no-caps
        @click="openGithub(deviceCodeInfo.verification_uri)"
      />

      <q-space />

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        :label="interval > 0 ? `请等待 ${interval} 秒` : '我已输入验证码'"
        :disable="interval > 0"
        no-caps
        @click="requestCode(deviceCodeInfo.device_code)"
      />
    </div>

    <div v-else>
      <div class="text-h2">获取验证码中</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthDataStore } from 'src/stores/AuthData';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { GithubDeviceCodeInfo } from 'src/class/GithubTokenInfo';
import { getDeviceTokenInfo, requestDeviceCode } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { copyToClipboard } from 'quasar';

const authDataStore = useAuthDataStore();
const router = useRouter();
const quasar = useQuasar();
const deviceCodeInfo = ref(undefined as GithubDeviceCodeInfo | undefined);
const interval = ref(100);

if (authDataStore.activeToken) {
  router.push({ name: 'home' });
} else if (authDataStore.activeRefreshToken) {
  authDataStore
    .refreshToken()
    .then(() => router.push({ name: 'home' }))
    .catch(() => {
      quasar.notify({
        type: 'warning',
        message: '刷新Github Token失败!',
        icon: matPriorityHigh,
      });
      authDataStore.clearAuthInfo();
    });
} else {
  requestDeviceCode()
    .then((codeInfo) => {
      deviceCodeInfo.value = codeInfo;
      interval.value = codeInfo.interval;
      copyToClipboard(codeInfo.user_code).then(() =>
        quasar.notify({
          message: '已复制验证码',
        })
      );
      const intervalId = setInterval(() => {
        interval.value--;
        if (interval.value <= 0) {
          clearInterval(intervalId);
        }
      }, 1000);
    })
    .catch(() => {
      quasar.notify({
        type: 'warning',
        message: '获取Github验证码失败!',
        icon: matPriorityHigh,
      });
      router.push('login');
    });
}

function openGithub(url: string) {
  window.open(url, '_blank');
}

function requestCode(deviceCode: string) {
  getDeviceTokenInfo(deviceCode)
    .then((token) => {
      authDataStore.updateToken(token);
      router.push({ name: 'home' });
    })
    .catch(() => {
      myLogger.debug('get device token info fail, route to login.');
      quasar.notify({
        type: 'warning',
        message: '获取 Github Device Token失败!',
        icon: matPriorityHigh,
      });
      router.push({ name: 'login' });
    });
}
</script>
