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
    @click="requestDeviceFlowToken(deviceCodeInfo.device_code)"
  />
</template>

<script setup lang="ts">
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { copyToClipboard, useQuasar } from 'quasar';
import { requestDeviceTokenInfo } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { GithubDeviceCodeInfo } from 'src/class/GithubTokenInfo';
import { ROUTE_HOME, ROUTE_LOGIN } from 'src/router';
import { useAuthDataStore } from 'src/stores/AuthData';
import { ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{ deviceCodeInfo: GithubDeviceCodeInfo }>();
const { deviceCodeInfo } = toRefs(props);
const { update: updateAuthData } = useAuthDataStore();
const { push: routerPush } = useRouter();
const { notify } = useQuasar();
const interval = ref(Number(deviceCodeInfo.value.interval) + 5);

copyToClipboard(deviceCodeInfo.value.user_code).then(() =>
  notify({
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
  window.open(deviceCodeInfo.value.verification_uri, '_blank');
}

async function requestDeviceFlowToken(deviceCode: string) {
  try {
    const token = await requestDeviceTokenInfo(deviceCode);
    await updateAuthData(token);
    routerPush({ name: ROUTE_HOME });
  } catch (error) {
    myLogger.error('Request device token info fail.', error);
    notify({
      type: 'warning',
      message: '获取Github设备Token失败!',
      icon: matPriorityHigh,
    });
    routerPush({ name: ROUTE_LOGIN });
  }
}
</script>
