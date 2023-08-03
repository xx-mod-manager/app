<template>
  <q-card>
    <q-card-section>
      <div class="col-12 row wrap justify-start items-center content-start">
        <AuthorSpan :author="comment.author" />
        <DateFormatSpan :date="comment.updatedAt" style="margin-left: 0.5rem" />
        <q-space />
        <CommentMenu
          :author="comment.author"
          @update="showEditInput = true"
          @delete="$emit('delete', comment.id)"
        />
      </div>
      <div class="markdown-body" v-html="comment.bodyHTML"></div>
      <ReactionGroupSpan :reactions="comment.reactionGroups" />
      <UpdateReplyBox
        v-if="showEditInput"
        :old-value="comment.body"
        @cancel="showEditInput = false"
        @submit="updateComment"
      />
    </q-card-section>
    <div v-if="comment.replies.nodes.length > 0">
      <q-separator inset />
      <q-card-section
        class="col-12 row wrap justify-start items-center content-start"
      >
        <ReplieItem
          v-for="replie in comment.replies.nodes"
          :key="replie.id"
          class="col-12"
          style="padding-left: 1rem; margin-top: 1rem"
          :replie="replie"
          @delete="deleteReply"
        />
        <a
          v-if="!comment.replies.isFull()"
          style="margin-top: 0.6rem"
          align="center"
          class="col-12"
          href="javascript:void(0);"
          @click="loadDiscussionReply(comment.id, comment.replies)"
        >
          加载更多
        </a>
      </q-card-section>
    </div>
    <q-separator />
    <q-card-section>
      <ReplyBox class="col-12" submit-btn-label="回复" @submit="addReply" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import 'github-markdown-css';
import {
  addDiscussionReply,
  deleteDiscussionReply,
  loadDiscussionReply,
  updateDiscussionComment,
} from 'src/api/GraphqlApi';
import { Comment } from 'src/class/Types';
import { ref, toRefs } from 'vue';
import AuthorSpan from './AuthorSpan.vue';
import CommentMenu from './CommentMenu.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import ReactionGroupSpan from './ReactionGroupSpan.vue';
import ReplieItem from './ReplieItem.vue';
import ReplyBox from './ReplyBox.vue';
import UpdateReplyBox from './UpdateReplyBox.vue';

defineEmits(['delete']);
const props = defineProps<{ comment: Comment; discussionId: string }>();
const { comment, discussionId } = toRefs(props);
const showEditInput = ref(false);

async function addReply(markdown: string) {
  await addDiscussionReply(
    markdown,
    discussionId.value,
    comment.value.id,
    comment.value.replies
  );
}
async function updateComment(markdown: string) {
  const newComment = await updateDiscussionComment(markdown, comment.value.id);
  comment.value.body = newComment.body;
  comment.value.bodyHTML = newComment.bodyHTML;
  comment.value.updatedAt = newComment.updatedAt;
  comment.value.id = newComment.id;
  showEditInput.value = false;
}

async function deleteReply(id: string) {
  const { totalCount, deletedReplyId } = await deleteDiscussionReply(id);
  comment.value.replies.deleteNode(totalCount, deletedReplyId);
}
</script>

<style>
h2 {
  font-size: 1.5rem;
}
</style>
