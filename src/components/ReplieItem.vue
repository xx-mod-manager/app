<template>
  <div>
    <div class="col-12 row wrap justify-start items-center content-start">
      <AuthorSpan :author="replie.author" />
      <DateFormatSpan :date="replie.updatedAt" style="margin-left: 0.5rem" />
      <q-space />
      <CommentMenu
        :author="replie.author"
        @update="showEditInput = true"
        @delete="$emit('delete', replie.id)"
      />
    </div>
    <div class="markdown-body" v-html="replie.bodyHTML"></div>
    <ReactionGroupSpan :reactions="replie.reactionGroups" />
    <UpdateReplyBox
      v-if="showEditInput"
      :old-value="replie.body"
      @cancel="showEditInput = false"
      @submit="updateReply"
    />
  </div>
</template>

<script setup lang="ts">
import 'github-markdown-css';
import { updateDiscussionReply } from 'src/api/GraphqlApi';
import { Comment } from 'src/class/Types';
import { ref, toRefs } from 'vue';
import AuthorSpan from './AuthorSpan.vue';
import CommentMenu from './CommentMenu.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import ReactionGroupSpan from './ReactionGroupSpan.vue';
import UpdateReplyBox from './UpdateReplyBox.vue';

defineEmits(['delete']);
const props = defineProps<{ replie: Comment }>();
const { replie } = toRefs(props);
const showEditInput = ref(false);

async function updateReply(markdown: string) {
  const newReply = await updateDiscussionReply(markdown, replie.value.id);
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
