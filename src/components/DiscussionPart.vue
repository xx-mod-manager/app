<template>
  <a
    style="margin-top: 0.6rem"
    align="center"
    class="col-12"
    :href="discussion.url"
    target="_blank"
    >去github讨论</a
  >

  <CommentCard
    v-for="comment in discussion.comments.nodes"
    :key="comment.id"
    style="margin-top: 0.6rem"
    class="col-12"
    :comment="comment"
    :discussion-id="discussion.id"
    @delete="deleteComment"
  />

  <a
    v-if="!discussion.comments.isFull()"
    style="margin-top: 0.6rem"
    align="center"
    class="col-12"
    href="javascript:void(0);"
    @click="loadDiscussionComment(discussion.id, discussion.comments)"
  >
    加载更多
  </a>
</template>

<script setup lang="ts">
import {
  deleteDiscussionComment,
  loadDiscussionComment,
} from 'src/api/GraphqlApi';
import { Discussion } from 'src/class/Types';
import { useTempDataStore } from 'src/stores/TempData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { toRefs } from 'vue';
import CommentCard from './CommentCard.vue';

const props = defineProps<{ discussion: Discussion }>();
const { discussion } = toRefs(props);
const tempDataStore = useTempDataStore();
const userConfigStore = useUserConfigStore();

async function deleteComment(id: string) {
  const { totalCount } = await deleteDiscussionComment(id);
  tempDataStore.deleteComment(
    userConfigStore.currentGameId,
    discussion.value.id,
    id,
    totalCount
  );
}
</script>
