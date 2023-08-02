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
import { useOnlineDataStore } from 'src/stores/OnlineData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { Ref, ref } from 'vue';
import CommentCard from './CommentCard.vue';

const props = defineProps<{ discussion: Discussion }>();
const onlineDataStore = useOnlineDataStore();
const userConfigStore = useUserConfigStore();
const discussion: Ref<Discussion> = ref(props.discussion);

async function deleteComment(id: string) {
  const { totalCount } = await deleteDiscussionComment(id);
  onlineDataStore.deleteComment(
    userConfigStore.currentGameId,
    props.discussion.id,
    id,
    totalCount
  );
}
</script>
