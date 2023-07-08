<template>
  <q-card>
    <q-card-section>
      <p class="text-h5">{{ release.name }}</p>
      <ModBadgesSpan :mod="mod" />
      <div style="margin-top: 0.5rem">
        <AuthorSpan :author="release.author" />
        <DateFormatSpan :date="release.updatedAt" style="margin-left: 0.5rem" />
      </div>
    </q-card-section>
    <q-separator inset />
    <q-card-section>
      <div class="markdown-body" v-html="release.descriptionHTML"></div>
      <!-- github release viewerHasReacted not work -->
      <!-- <ReactionGroupSpan :reactions="release.reactionGroups" /> -->
    </q-card-section>
    <q-separator />
    <q-card-section>
      <AssetItem
        v-for="asset in release.releaseAssets.nodes"
        :key="asset.id"
        :asset="asset"
      />
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Release } from 'src/class/GraphqlClass';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import 'github-markdown-css';
import { Mod } from 'src/class/Mod';
import ModBadgesSpan from './ModBadgesSpan.vue';
import AssetItem from './AssetItem.vue';

defineProps<{
  release: Release;
  mod: Mod;
}>();
</script>
