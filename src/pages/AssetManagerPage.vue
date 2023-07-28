<template>
  <p>User Data: {{ userData }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const userData = ref(undefined as string | undefined);

window.electronApi.getUserData().then((value) => (userData.value = value));
</script>
