<template>
  <span>
    <q-avatar size="2.2rem">
      <img :src="author.avatarUrl" />
    </q-avatar>
    <span class="text-subtitle2" style="margin-left: 0.5rem">
      {{ author.login }}
    </span>
  </span>
</template>
<script setup lang="ts">
import { Author } from 'src/class/Types';

defineProps<{
  author: Author;
}>();
</script>
