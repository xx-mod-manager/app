<template>
  <q-card>
    <q-card-section>
      <p class="text-h5">{{ release.name }}</p>
      <div>
        <AuthorSpan :author="release.author" />
        <DateFormatSpan :date="release.updatedAt" style="margin-left: 0.5rem;" />
      </div>
    </q-card-section>
    <q-separator inset />
    <q-card-section>
      <div v-html="release.descriptionHTML"></div>
      <ReactionGroupSpan :reactions="release.reactionGroups" />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <a v-for="asset in release.releaseAssets.nodes" :key="asset.downloadUrl" :href="asset.downloadUrl">
        <p>{{ asset.name }}</p>
      </a>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Release } from 'src/class/GraphqlClass';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import ReactionGroupSpan from './ReactionGroupSpan.vue';

defineProps<{
  release: Release;
}>();
</script>
