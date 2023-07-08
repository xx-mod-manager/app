<template>
  <div>
    <div>
      <AuthorSpan :author="replie.author" />
      <DateFormatSpan :date="replie.updatedAt" style="margin-left: 0.5rem" />
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
