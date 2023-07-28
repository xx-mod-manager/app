<template>
  <QPullToRefresh :icon="matRefresh" @refresh="refresh">
    <q-page
      class="fit row wrap justify-start items-start content-start"
      style="padding: 0.3rem"
    >
      <template v-if="asset && detail">
        <AssetCard
          class="col-12"
          :discussion="detail.discussion"
          :asset="asset"
          :release-assets="detail.release.releaseAssets.nodes"
        />

        <DiscussionPart :discussion="detail.discussion" />

        <ReplyBox
          v-if="detail.discussion"
          style="margin-top: 1rem"
          class="col-12"
          submit-btn-label="评论"
          default-open
          @submit="addComment"
        />
      </template>

      <p v-else>没有数据</p>
    </q-page>
  </QPullToRefresh>
</template>

<script setup lang="ts">
import { matRefresh } from '@quasar/extras/material-icons';
import { QPullToRefresh, useQuasar } from 'quasar';
import { addDiscussionComment, getAssetDetail } from 'src/api/GraphqlApi';
import { myLogger } from 'src/boot/logger';
import { Discussion, Release } from 'src/class/Types';
import AssetCard from 'src/components/AssetCard.vue';
import DiscussionPart from 'src/components/DiscussionPart.vue';
import ReplyBox from 'src/components/ReplyBox.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const mainDataStore = useMainDataStore();
const { loading } = useQuasar();

const asset = mainDataStore.getAssetById(route.params.id as string);
const detail = ref(
  undefined as { release: Release; discussion: Discussion } | undefined
);

async function refresh(done: () => void) {
  if (asset) {
    myLogger.debug(`refresh mod detail ${asset.id}`);
    detail.value = await getAssetDetail(asset);
    mainDataStore.updateReleaseAssets(
      asset,
      detail.value.release.releaseAssets.nodes
    );
    if (loading.isActive) loading.hide();
    done();
  } else {
    if (loading.isActive) loading.hide();
    done();
    router.replace('/404');
  }
}

async function addComment(markdown: string) {
  if (detail.value?.discussion) {
    await addDiscussionComment(
      markdown,
      detail.value.discussion.id,
      detail.value.discussion.comments
    );
  }
}

onMounted(() => {
  loading.show();
  refresh(() => {
    true;
  });
});
</script>
