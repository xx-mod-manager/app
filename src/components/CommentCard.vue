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
      <q-card-section>
        <ReplieItem
          v-for="replie in comment.replies.nodes"
          :key="replie.id"
          style="padding-left: 1rem; margin-top: 1rem"
          :replie="replie"
          @delete="deleteReply"
        />
      </q-card-section>
    </div>
    <q-separator />
    <q-card-section>
      <ReplyBox class="col-12" submit-btn-label="回复" @submit="addComment" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { Comment } from 'src/class/GraphqlClass';
import ReplieItem from './ReplieItem.vue';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import ReactionGroupSpan from './ReactionGroupSpan.vue';
import ReplyBox from './ReplyBox.vue';
import {
  addDiscussionReply,
  deleteDiscussionReply,
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

async function addComment(markdown: string) {
  const newComment = await addDiscussionReply(
    markdown,
    props.discussionId,
    props.comment.id
  );
  comment.value.replies.nodes.push(newComment);
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
  const deletedReply = await deleteDiscussionReply(id);
  const newReplys = comment.value.replies.nodes.filter(
    (it) => it.id != deletedReply.id
  );
  comment.value.replies.nodes = newReplys;
}
</script>

<style>
h2 {
  font-size: 1.5rem;
}
</style>
