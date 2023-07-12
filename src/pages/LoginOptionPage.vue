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
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { myLogger } from 'src/boot/logger';

defineEmits(['deviceAuth']);

const quasar = useQuasar();

const availableOauth = !(
  quasar.platform.is.electron || quasar.platform.is.capacitor
);
myLogger.debug(
  `availableOauth: ${availableOauth}, electron: ${quasar.platform.is.electron}, capacitor: ${quasar.platform.is.capacitor}`
);

function oauth() {
  quasar.loading.show({ message: '跳转Github授权页面...', delay: 400 });
  window.open(
    'https://github.com/login/oauth/authorize?client_id=Iv1.23bebc2931676eb7',
    '_self'
  );
}
</script>
