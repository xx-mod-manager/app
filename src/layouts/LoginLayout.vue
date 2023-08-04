<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <OauthAuthPage v-if="oauthCode" :code="oauthCode" />

      <DeviceAuthPage
        v-else-if="deviceCodeInfo"
        :device-code-info="deviceCodeInfo"
      />

      <LoginOptionPage v-else @device-auth="requestDeviceCodeInfo" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import { requestDeviceCode } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { GithubDeviceCodeInfo } from 'src/class/GithubTokenInfo';
import DeviceAuthPage from 'src/pages/login/DeviceAuthPage.vue';
import LoginOptionPage from 'src/pages/login/LoginOptionPage.vue';
import OauthAuthPage from 'src/pages/login/OauthAuthPage.vue';
import { ROUTE_LOGIN } from 'src/router';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const { push: routerPush } = useRouter();
const { loading, notify } = useQuasar();

const oauthCode = ref(undefined as string | undefined);
const deviceCodeInfo = ref(undefined as GithubDeviceCodeInfo | undefined);

if (typeof route.query.code === 'string') {
  myLogger.info(`From github callback return, code is ${route.query.code}.`);
  oauthCode.value = route.query.code;
}

async function requestDeviceCodeInfo() {
  loading.show({ message: '获取验证码中', delay: 400 });
  try {
    deviceCodeInfo.value = await requestDeviceCode();
  } catch (error) {
    myLogger.error('Request device code fail.', error);
    notify({
      type: 'warning',
      message: '获取Github验证码失败!',
      icon: matPriorityHigh,
    });
    routerPush({ name: ROUTE_LOGIN });
  } finally {
    loading.hide();
  }
}
</script>
