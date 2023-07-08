<template>
  <span>
    <q-avatar size="2.2rem">
      <img :src="props.author.avatarUrl" />
    </q-avatar>
    <span class="text-subtitle2" style="margin-left: 0.5rem">
      {{ props.author.login }}
    </span>
  </span>
</template>
<script setup lang="ts">
import { Author } from 'src/class/GraphqlClass';

const props = defineProps<{
  author: Author;
}>();
</script>
