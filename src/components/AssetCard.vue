<template>
  <q-card>
    <q-card-section>
      <p class="text-h5">{{ discussion.title }}</p>

      <AssetBadges :asset="asset" />

      <div style="margin-top: 0.5rem">
        <AuthorSpan :author="discussion.author" />

        <DateFormatSpan
          :date="discussion.updatedAt"
          style="margin-left: 0.5rem"
        />
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-section>
      <div class="markdown-body" v-html="discussion.bodyHTML"></div>

      <!-- github release viewerHasReacted not work -->
      <!-- <ReactionGroupSpan :reactions="release.reactionGroups" /> -->
    </q-card-section>

    <q-separator />

    <q-card-section>
      <AssetItem
        v-for="assetFile in filterReleaseAsset(releaseAssets)"
        :key="assetFile.id"
        :asset="assetFile"
      />
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Asset, Discussion, ReleaseAsset } from 'src/class/Types';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import 'github-markdown-css';
import AssetItem from './AssetItem.vue';
import AssetBadges from './AssetBadges.vue';

defineProps<{
  discussion: Discussion;
  releaseAssets: ReleaseAsset[];
  asset: Asset;
}>();

function filterReleaseAsset(releaseAssets: ReleaseAsset[]) {
  return releaseAssets.filter((it) => it.contentType == 'application/zip');
}
</script>
