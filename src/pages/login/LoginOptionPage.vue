<template>
  <div class="text-h2">授权Github登陆</div>

  <q-btn
    v-if="availableOauth"
    class="q-mt-xl"
    color="white"
    text-color="blue"
    unelevated
    label="Github网页授权"
    no-caps
    @click="oauth"
  />

  <q-space />

  <q-btn
    class="q-mt-xl"
    color="white"
    text-color="blue"
    unelevated
    label="Github验证码授权"
    no-caps
    @click="$emit('deviceAuth')"
  />

  <q-space />

  <q-btn
    v-if="platform.is.electron"
    class="q-mt-xl"
    color="white"
    text-color="blue"
    unelevated
    label="进入离线模式"
    no-caps
    :to="{ name: ROUTE_HOME }"
  />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { URL_GITHUB_REQUEST_CODE } from 'src/api/GithubAuthApi';
import { ROUTE_HOME } from 'src/router';

defineEmits(['deviceAuth']);

const { loading, platform } = useQuasar();

const availableOauth = !(platform.is.electron || platform.is.capacitor);

function oauth() {
  loading.show({ message: '跳转Github授权页面...', delay: 400 });
  window.open(URL_GITHUB_REQUEST_CODE, '_self');
}
</script>
