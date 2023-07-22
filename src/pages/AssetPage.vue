<template>
  <QPullToRefresh :icon="matRefresh" @refresh="refresh">
    <q-page
      class="fit row wrap justify-start items-start content-start"
      style="padding: 0.3rem"
    >
      <template v-if="asset && detail">
        <AssetCard class="col-12" :asset="asset" :release="detail.release" />

        <template v-if="detail.discussion">
          <DiscussionPart :discussion="detail.discussion" />
        </template>

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
import { QPullToRefresh, useQuasar } from 'quasar';
import { addDiscussionComment, getAssetDetail } from 'src/api/GraphqlApi';
import { myLogger } from 'src/boot/logger';
import { Release, Discussion } from 'src/class/Types';
import { useMainDataStore } from 'src/stores/MainData';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AssetCard from 'src/components/AssetCard.vue';
import ReplyBox from 'src/components/ReplyBox.vue';
import { matRefresh } from '@quasar/extras/material-icons';
import DiscussionPart from 'src/components/DiscussionPart.vue';

const route = useRoute();
const router = useRouter();
const mainDataStore = useMainDataStore();
const { loading } = useQuasar();

const asset = mainDataStore.getAssetById(route.params.id as string);
const detail = ref(
  undefined as
    | { release: Release; discussion: Discussion | undefined }
    | undefined
);

async function refresh(done: () => void) {
  if (asset) {
    myLogger.debug(`refresh mod detail ${asset?.id}`);
    detail.value = await getAssetDetail(asset);
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
