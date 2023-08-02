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
import { ROUTE_404 } from 'src/router';
import { useMainDataStore } from 'src/stores/MainData';
import { useTempDataStore } from 'src/stores/OnlineData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { newOnlineAsset } from 'src/utils/AssetUtils';
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

const userConfigStore = useUserConfigStore();
const mainDataStore = useMainDataStore();
const tempDataStore = useTempDataStore();
const route = useRoute();
const refreshing = ref(false);
const resourceid = route.params.id as string;
const currentGameId = computed(() => userConfigStore.currentGameId);
const resource = mainDataStore.getResourceById(currentGameId.value, resourceid);
const detail = computed(() => {
  return tempDataStore.getOptionResourceDetail(
    currentGameId.value,
    resource.releaseNodeId,
    resource.discussionNodeId
  );
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
  mainDataStore.updateOnlineAssets(
    currentGameId.value,
    resourceid,
    newResourceDetail.release.releaseAssets.nodes.map(newOnlineAsset)
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

onBeforeRouteUpdate((to) => {
  const resourceid = to.params.id as string;
  const resource = useMainDataStore().getOptionResourceById(
    useUserConfigStore().currentGameId,
    resourceid
  );
  if (resource === undefined) {
    return { name: ROUTE_404 };
  }
  return true;
});
</script>
