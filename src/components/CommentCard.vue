<template>
  <q-card>
    <q-card-section>
      <div class="col">
        <AuthorSpan :author="comment.author" />
        <DateFormatSpan :date="comment.updatedAt" style="margin-left: 0.5rem;" />
      </div>
      <div v-html="comment.bodyHTML"></div>
      <ReactionGroupSpan :reactions="comment.reactionGroups" />
    </q-card-section>
    <q-separator inset />
    <q-card-section>
      <ReplieItem v-for="replie in comment.replies.nodes" :key="replie.id" :replie="replie" />
    </q-card-section>
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
import { addDiscussionReply } from 'src/api/GraphqlApi';
import { ref } from 'vue';

const props = defineProps<{ comment: Comment, discussionId: string }>();
const comment = ref(props.comment)

async function addComment(markdown: string) {
  const newComment = await addDiscussionReply(markdown, props.discussionId, props.comment.id)
  comment.value.replies.nodes.push(newComment)
}
</script>

<style>
h2 {
  font-size: 1.5rem;
}
</style>
