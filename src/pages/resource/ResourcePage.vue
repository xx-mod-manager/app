<template>
  <q-pull-to-refresh :icon="matRefresh" @refresh="refresh">
    <q-page
      class="fit row wrap justify-start items-start content-start"
      style="padding: 0.3rem"
    >
      <template v-if="detail">
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
import { existResourceGuard } from 'src/router/routes';
import { useMainDataStore } from 'src/stores/MainData';
import { useTempDataStore } from 'src/stores/TempData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { notNull } from 'src/utils/CommentUtils';
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const tempDataStore = useTempDataStore();
const route = useRoute();
const refreshing = ref(false);
const resourceid = route.params.id as string;
const currentGameId = computed(() => userConfigStore.currentGameId);
const resource = notNull(
  mainDataStore.currentGame.resources.get(resourceid),
  `Resource[${resourceid}]`
);
const detail = computed(() => {
  return resource.releaseNodeId != null && resource.discussionNodeId != null
    ? tempDataStore.getOptionResourceDetail(
        currentGameId.value,
        resource.releaseNodeId,
        resource.discussionNodeId
      )
    : undefined;
});

async function refresh(done?: () => void) {
  if (refreshing.value) {
    myLogger.warn('Multiple refresh resource.');
    if (done) done();
    return;
  }
  myLogger.debug(`Start refresh resource ${resourceid}`);
  refreshing.value = true;
  const newResourceDetail = await getResourceDetail(resource);
  tempDataStore.updateResourceDetail(
    currentGameId.value,
    await getResourceDetail(resource)
  );
  resource.updateApiReleaseAssets(
    newResourceDetail.release.releaseAssets.nodes
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
    tempDataStore.needRefreshResource(
      currentGameId.value,
      detail.value.release.id,
      detail.value.discussion.id
    )
  ) {
    refresh();
  }
});

onBeforeRouteUpdate(existResourceGuard);
</script>
