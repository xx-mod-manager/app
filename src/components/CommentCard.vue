<template>
  <q-card>
    <q-card-section>
      <div class="col-12 row wrap justify-start items-center content-start">
        <AuthorSpan :author="comment.author" />
        <DateFormatSpan :date="comment.updatedAt" style="margin-left: 0.5rem" />
        <q-space />
        <CommentMenu
          @update="showEditInput = true"
          @delete="$emit('delete', comment.id)"
        />
      </div>
      <div class="markdown-body" v-html="comment.bodyHTML"></div>
      <ReactionGroupSpan :reactions="comment.reactionGroups" />
      <UpdateReplyBox
        v-if="showEditInput"
        submit-btn-label="评论"
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
import { Comment } from 'src/class/Types';
import ReplieItem from './ReplieItem.vue';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import ReactionGroupSpan from './ReactionGroupSpan.vue';
import ReplyBox from './ReplyBox.vue';
import {
  addDiscussionReply,
  deleteDiscussionReply,
  loadDiscussionReply,
  updateDiscussionComment,
} from 'src/api/GraphqlApi';
import { ref } from 'vue';
import 'github-markdown-css';
import CommentMenu from './CommentMenu.vue';
import UpdateReplyBox from './UpdateReplyBox.vue';

defineEmits(['delete']);
const props = defineProps<{ comment: Comment; discussionId: string }>();
const comment = ref(props.comment);
const showEditInput = ref(false);

async function addReply(markdown: string) {
  const newComment = await addDiscussionReply(
    markdown,
    props.discussionId,
    props.comment.id
  );
  newComment.cursor = comment.value.cursor;
  comment.value = newComment;
}
async function updateComment(markdown: string) {
  const newComment = await updateDiscussionComment(markdown, props.comment.id);
  comment.value.body = newComment.body;
  comment.value.bodyHTML = newComment.bodyHTML;
  comment.value.updatedAt = newComment.updatedAt;
  comment.value.id = newComment.id;
  showEditInput.value = false;
}

async function deleteReply(id: string) {
  const newComment = await deleteDiscussionReply(id);
  newComment.cursor = comment.value.cursor;
  comment.value = newComment;
}
</script>

<style>
h2 {
  font-size: 1.5rem;
}
</style>
