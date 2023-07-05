<template>
  <q-card>
    <q-card-section>
      <div class="col">
        <q-avatar size="2.2rem">
          <img :src="props.comment.author.avatarUrl">
        </q-avatar>
        <span class="text-subtitle2" style="margin-left: 0.5rem;">
          {{ props.comment.author.login }}
        </span>
        <span style="margin-left: 0.5rem;">
          {{ date.formatDate(props.comment.updatedAt, 'YY/MM/DD/HH:mm:ss') }}
        </span>
      </div>
      <div v-html="props.comment.bodyHTML"></div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <ReplieItem v-for="replie in props.comment.replies.nodes" :key="replie.id" :replie="replie" />
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Comment } from 'src/class/GraphqlClass';
import ReplieItem from './ReplieItem.vue';
import { date } from 'quasar'

const props = defineProps<{
  comment: Comment;
}>();
</script>
<style>
h2 {
  font-size: 1.5rem;
}
</style>
