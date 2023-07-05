<template>
  <q-card>
    <q-card-section>
      <span class="text-h5">{{ props.release.name }}</span>
    </q-card-section>
    <q-separator inset />
    <q-card-section class="text-body3">{{ props.release.description }}</q-card-section>
    <q-separator />
    <q-card-section>
      <a v-for="asset in props.release.releaseAssets.nodes" :key="asset.downloadUrl" :href="asset.downloadUrl">
        <p>{{ asset.name }}</p>
      </a>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Release } from 'src/class/GraphqlClass';

const props = defineProps<{
  release: Release;
}>();
</script>
