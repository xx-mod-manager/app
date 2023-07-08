<template>
  <q-pull-to-refresh ref="pullRefresh" @refresh="refresh">
    <q-page class="fit row wrap justify-start items-start content-start" style="padding: 0.3rem;">
      <template v-if="detail">
        <ModDetail class="col-12" :release="detail.release" />
        <template v-if="detail.discussion">
          <CommentCard style="margin-top: 0.6rem;" class="col-12" v-for="comment in detail.discussion?.comments.nodes"
            :key="comment.id" :comment="comment" :discussion-id="detail.discussion?.id" />
        </template>
        <ReplyBox style="margin-top: 1rem;" v-if="detail.discussion" class="col-12" submit-btn-label="评论" default-open
          @submit="addComment" />
      </template>
      <template>
        <p>没获取到数据</p>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { QPullToRefresh, useQuasar } from 'quasar';
import { addDiscussionComment, getModDetail } from 'src/api/GraphqlApi';
import { myLogger } from 'src/boot/logger';
import { Release, Discussion } from 'src/class/GraphqlClass';
import { useMainDataStore } from 'src/stores/MainData';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ModDetail from 'src/components/ModDetail.vue';
import CommentCard from 'src/components/CommentCard.vue';
import ReplyBox from 'src/components/ReplyBox.vue';

const route = useRoute();
const router = useRouter();
const mainDataStore = useMainDataStore();
const { loading } = useQuasar();
const mod = mainDataStore.getMod(route.params.id as string);
const detail = ref(
  undefined as
  | { release: Release; discussion: Discussion | undefined }
  | undefined
);

async function refresh(done: () => void) {
  if (mod) {
    myLogger.debug(`refresh mod detail ${mod?.mod_id}`);
    detail.value = await getModDetail(mod);
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
    const newComment = await addDiscussionComment(markdown, detail.value.discussion.id)
    detail.value.discussion.comments.nodes.push(newComment)
  }
}

const pullRefresh = ref(null as QPullToRefresh | null);

onMounted(() => {
  if (pullRefresh.value) {
    loading.show();
    pullRefresh.value.trigger();
  }
});
</script>
