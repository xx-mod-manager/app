<template>
  <q-card flat bordered @click="clickMod()">
    <q-card-section>
      <span class="text-subtitle2">{{ asset.name }}</span>
      <AssetBadges :asset="asset" />
    </q-card-section>
    <q-separator inset />
    <q-card-section class="text-body2">{{ asset.description }}</q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import AssetBadges from './AssetBadges.vue';
import { Asset } from 'src/class/Types';

const router = useRouter();
const props = defineProps<{
  asset: Asset;
}>();

function clickMod() {
  router.push({ name: 'asset', params: { id: props.asset.id } });
}
</script>
