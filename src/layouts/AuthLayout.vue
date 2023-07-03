<template>
  <p>认证登陆中</p>
</template>
<script setup lang="ts">
import { getTokenInfo } from 'src/api/GithubDeviceAuthApi';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useRoute, useRouter } from 'vue-router';

const authDataStore = useAuthDataStore();
const route = useRoute();
const router = useRouter();

getTokenInfo(route.query.code as string).then(async (token) => {
  await authDataStore.updateToken(token);
  router.push('/');
});
</script>
