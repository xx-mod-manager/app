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
import { Loading, useQuasar } from 'quasar';
import { requestDeviceCode } from 'src/api/GithubAuthApi';
import { GithubDeviceCodeInfo } from 'src/class/GithubTokenInfo';
import DeviceAuthPage from 'src/pages/login/DeviceAuthPage.vue';
import LoginOptionPage from 'src/pages/login/LoginOptionPage.vue';
import OauthAuthPage from 'src/pages/login/OauthAuthPage.vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const quasar = useQuasar();

const oauthCode = ref(undefined as string | undefined);
const deviceCodeInfo = ref(undefined as GithubDeviceCodeInfo | undefined);

if (route.query.code) {
  oauthCode.value = route.query.code as string;
}

function requestDeviceCodeInfo() {
  Loading.show({ message: '获取验证码中', delay: 400 });
  requestDeviceCode()
    .then((codeInfo) => {
      deviceCodeInfo.value = codeInfo;
    })
    .catch(() => {
      quasar.notify({
        type: 'warning',
        message: '获取Github验证码失败!',
        icon: matPriorityHigh,
      });
      router.push('login');
    })
    .finally(() => Loading.hide());
}
</script>
