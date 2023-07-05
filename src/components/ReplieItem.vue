<template>
  <div>
    <div>
      <AuthorSpan :author="replie.author" />
      <DateFormatSpan :date="replie.updatedAt" style="margin-left: 0.5rem;" />
    </div>
    <div v-html="replie.bodyHTML"></div>
  </div>
</template>

<script setup lang="ts">
import { Replie } from 'src/class/GraphqlClass';
import AuthorSpan from './AuthorSpan.vue';
import DateFormatSpan from './DateFormatSpan.vue';

defineProps<{ replie: Replie }>();
</script>
