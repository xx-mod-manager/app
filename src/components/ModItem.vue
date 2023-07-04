<template>
  <q-card flat bordered @click="clickMod()">
    <q-card-section>
      <span class="text-subtitle2">{{ props.mod.name }}</span>
      <q-badge
        >{{ props.mod.downloadCount }}<q-icon name="download" color="white"
      /></q-badge>
      <q-badge color="accent" label="作者 todo" />
      <q-badge color="secondary" label="分类 todo" />
      <q-badge color="info" :label="props.mod.repo" />
    </q-card-section>
    <q-separator inset />
    <q-card-section class="text-body2">{{
      props.mod.description
    }}</q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Mod } from 'src/class/Mod';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps<{
  mod: Mod;
}>();

function clickMod() {
  router.push(`/mod/${props.mod.mod_id}`);
}
</script>
<style lang="scss">
.q-badge {
  margin-left: 0.3rem;
}
</style>
