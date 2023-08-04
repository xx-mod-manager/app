<template>
  <div class="text-h2">认证Github授权中...</div>

  <q-space />

  <q-spinner color="white" size="7rem" :thickness="10" />
</template>

<script setup lang="ts">
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import { getTokenInfo } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { ROUTE_HOME, ROUTE_LOGIN } from 'src/router';
import { useAuthDataStore } from 'src/stores/AuthData';
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{ code: string }>();
const { code } = toRefs(props);
const { update: updateAuthData } = useAuthDataStore();
const { push: routerPush } = useRouter();
const { notify } = useQuasar();

getTokenInfo(code.value)
  .then((token) => {
    updateAuthData(token).then(() => {
      routerPush({ name: ROUTE_HOME });
    });
  })
  .catch((error) => {
    myLogger.error('Get token info fail.', error);
    notify({
      type: 'warning',
      message: '获取Github Token失败!',
      icon: matPriorityHigh,
    });
    routerPush({ name: ROUTE_LOGIN });
  });
</script>
