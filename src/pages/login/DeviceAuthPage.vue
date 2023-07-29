<template>
  <div class="text-h3">验证码</div>
  <div class="text-h2">{{ deviceCodeInfo.user_code }}</div>

  <q-btn
    class="q-mt-xl"
    color="white"
    text-color="blue"
    unelevated
    label="打开Github"
    no-caps
    @click="openGithub()"
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
</template>

<script setup lang="ts">
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { copyToClipboard, useQuasar } from 'quasar';
import { getDeviceTokenInfo } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { GithubDeviceCodeInfo } from 'src/class/GithubTokenInfo';
import { ROUTE_HOME, ROUTE_LOGIN } from 'src/router';
import { useAuthDataStore } from 'src/stores/AuthData';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{ deviceCodeInfo: GithubDeviceCodeInfo }>();

const authDataStore = useAuthDataStore();
const router = useRouter();
const quasar = useQuasar();
const interval = ref(props.deviceCodeInfo.interval + 5);

copyToClipboard(props.deviceCodeInfo.user_code).then(() =>
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

function openGithub() {
  window.open(props.deviceCodeInfo.verification_uri, '_blank');
}

function requestCode(deviceCode: string) {
  getDeviceTokenInfo(deviceCode)
    .then((token) => {
      authDataStore.update(token);
      router.push({ name: ROUTE_HOME });
    })
    .catch(() => {
      myLogger.debug('get device token info fail, route to login.');
      quasar.notify({
        type: 'warning',
        message: '获取 Github Device Token失败!',
        icon: matPriorityHigh,
      });
      router.push({ name: ROUTE_LOGIN });
    });
}
</script>
