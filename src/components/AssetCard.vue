<template>
  <q-card>
    <q-card-section>
      <p class="text-h5">{{ asset.name }}</p>

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
      <ReleaseAssetItem
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
import ReleaseAssetItem from './ReleaseAssetItem.vue';
import AssetBadges from './AssetBadges.vue';
import { filterReleaseAsset } from 'src/utils/AssetUtils';

defineProps<{
  discussion: Discussion;
  releaseAssets: ReleaseAsset[];
  asset: Asset;
}>();
</script>
