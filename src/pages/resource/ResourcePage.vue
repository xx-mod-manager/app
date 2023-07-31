<template>
  <q-pull-to-refresh :icon="matRefresh" @refresh="refresh">
    <q-page
      class="fit row wrap justify-start items-start content-start"
      style="padding: 0.3rem"
    >
      <template v-if="resource && detail">
        <ResourceCard
          class="col-12"
          :discussion="detail.discussion"
          :resource="resource"
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

      <q-inner-loading :showing="refreshing" />
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { matRefresh } from '@quasar/extras/material-icons';
import { addDiscussionComment, getResourceDetail } from 'src/api/GraphqlApi';
import { myLogger } from 'src/boot/logger';
import DiscussionPart from 'src/components/DiscussionPart.vue';
import ReplyBox from 'src/components/ReplyBox.vue';
import ResourceCard from 'src/components/ResourceCard.vue';
import { useMainDataStore } from 'src/stores/MainData';
import { useOnlineDataStore } from 'src/stores/OnlineData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { newOnlineAsset } from 'src/utils/AssetUtils';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const onlineDataStore = useOnlineDataStore();
const route = useRoute();
const router = useRouter();
const refreshing = ref(false);

//TODO getResourceById to getOptionResourceById
const resource = mainDataStore.getResourceById(
  userConfigStore.currentGameId,
  route.params.id as string
);
if (resource == undefined) {
  router.replace('/404');
}
const detail = ref(
  onlineDataStore.getOptionResourceDetail(
    userConfigStore.currentGameId,
    resource?.releaseNodeId,
    resource?.discussionNodeId
  )
);

async function refresh(done?: () => void) {
  if (refreshing.value) {
    myLogger.warn('Multiple refresh resource.');
    if (done) done();
    return;
  }
  if (resource == undefined) {
    router.replace('/404');
    if (done) done();
    return;
  }
  myLogger.debug(`Start refresh resource ${resource.id}`);
  refreshing.value = true;
  detail.value = await getResourceDetail(resource);
  onlineDataStore.addRelease(
    userConfigStore.currentGameId,
    detail.value.release
  );
  onlineDataStore.addDiscussion(
    userConfigStore.currentGameId,
    detail.value.discussion
  );
  mainDataStore.updateOnlineAssets(
    userConfigStore.currentGameId,
    resource.id,
    detail.value.release.releaseAssets.nodes.map(newOnlineAsset)
  );
  refreshing.value = false;
  if (done) done();
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
  if (
    detail.value == undefined ||
    onlineDataStore.needRefreshResource(
      userConfigStore.currentGameId,
      detail.value.release.id,
      detail.value.discussion.id
    )
  ) {
    refresh();
  }
});
</script>
