<template>
  <div class="col">
    <q-avatar size="2rem">
      <img :src="props.replie.author.avatarUrl">
    </q-avatar>
    <span class="text-subtitle2" style="margin-left: 0.5rem;">
      {{ props.replie.author.login }}
    </span>
    <span style="margin-left: 0.5rem;">
      {{ date.formatDate(props.replie.updatedAt, 'YY/MM/DD/HH:mm:ss') }}
    </span>
  </div>
  <div v-html="props.replie.bodyHTML"></div>
</template>
<script setup lang="ts">
import { Replie } from 'src/class/GraphqlClass';
import { date } from 'quasar'

const props = defineProps<{
  replie: Replie;
}>();
</script>
