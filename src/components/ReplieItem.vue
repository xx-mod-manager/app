<template>
  <div>
    <div class="col-12 row wrap justify-start items-center content-start">
      <AuthorSpan :author="replie.author" />
      <DateFormatSpan :date="replie.updatedAt" style="margin-left: 0.5rem" />
      <q-space />
      <CommentMenu
        @update="$emit('update', replie.id)"
        @delete="$emit('delete', replie.id)"
      />
    </div>
    <div class="markdown-body" v-html="replie.bodyHTML"></div>
    <ReactionGroupSpan :reactions="replie.reactionGroups" />
  </div>
</template>

<script setup lang="ts">
import { Replie } from 'src/class/GraphqlClass';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import ReactionGroupSpan from './ReactionGroupSpan.vue';
import 'github-markdown-css';
import CommentMenu from './CommentMenu.vue';

defineEmits(['update', 'delete']);
defineProps<{ replie: Replie }>();
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
