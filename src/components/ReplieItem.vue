<template>
  <div>
    <div class="col-12 row wrap justify-start items-center content-start">
      <AuthorSpan :author="replie.author" />
      <DateFormatSpan :date="replie.updatedAt" style="margin-left: 0.5rem" />
      <q-space />
      <CommentMenu
        @update="showEditInput = true"
        @delete="$emit('delete', replie.id)"
      />
    </div>
    <div class="markdown-body" v-html="replie.bodyHTML"></div>
    <ReactionGroupSpan :reactions="replie.reactionGroups" />
    <UpdateReplyBox
      v-if="showEditInput"
      submit-btn-label="回复"
      :old-value="replie.body"
      @cancel="showEditInput = false"
      @submit="updateReply"
    />
  </div>
</template>

<script setup lang="ts">
import { Replie } from 'src/class/GraphqlClass';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import ReactionGroupSpan from './ReactionGroupSpan.vue';
import 'github-markdown-css';
import CommentMenu from './CommentMenu.vue';
import { updateDiscussionReply } from 'src/api/GraphqlApi';
import { ref } from 'vue';
import UpdateReplyBox from './UpdateReplyBox.vue';

defineEmits(['delete']);
const props = defineProps<{ replie: Replie }>();
const replie = ref(props.replie);
const showEditInput = ref(false);

async function updateReply(markdown: string) {
  const newReply = await updateDiscussionReply(markdown, props.replie.id);
  replie.value.body = newReply.body;
  replie.value.bodyHTML = newReply.bodyHTML;
  replie.value.updatedAt = newReply.updatedAt;
  replie.value.id = newReply.id;
  showEditInput.value = false;
}
</script>

<style>
.markdown-body {
  padding-top: 0;
  padding-bottom: 5px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding-top: 0;
    padding-bottom: 2px;
  }
}
</style>
