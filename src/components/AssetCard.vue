<template>
  <q-card>
    <q-card-section>
      <p class="text-h5">{{ release.name }}</p>

      <AssetBadges :asset="asset" />

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
        v-for="assetFile in filterReleaseAsset(release.releaseAssets.nodes)"
        :key="assetFile.id"
        :asset="assetFile"
      />
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Asset, Release, ReleaseAsset } from 'src/class/Types';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import 'github-markdown-css';
import AssetItem from './AssetItem.vue';
import AssetBadges from './AssetBadges.vue';

defineProps<{
  release: Release;
  asset: Asset;
}>();

function filterReleaseAsset(releaseAssets: ReleaseAsset[]) {
  return releaseAssets.filter((it) => it.contentType == 'application/zip');
}
</script>
