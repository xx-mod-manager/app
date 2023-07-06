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
  </q-card>
</template>

<script setup lang="ts">
import { Comment } from 'src/class/GraphqlClass';
import ReplieItem from './ReplieItem.vue';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';
import ReactionGroupSpan from './ReactionGroupSpan.vue';

defineProps<{ comment: Comment }>();
</script>

<style>
h2 {
  font-size: 1.5rem;
}
</style>
