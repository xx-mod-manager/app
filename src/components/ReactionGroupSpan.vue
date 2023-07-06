<template>
  <span>
    <q-btn v-for="reaction in reactions" :key="reaction.content" unelevated rounded color="primary">
      <q-badge>
        <q-icon :name="iconMap.get(reaction.content)" />
        <span>{{ reaction.reactors.totalCount }}</span>
      </q-badge>
    </q-btn>
  </span>
</template>

<script setup lang="ts">
import { ReactionGroup } from 'src/class/GraphqlClass';

const iconMap: Map<string, string> = new Map([
  ['THUMBS_UP', 'thumb_up'],
  ['LAUGH', 'emoji_emotions'],
  ['HOORAY', 'celebration'],
  ['HEART', 'favorite'],
  ['ROCKET', 'rocket_launch'],
  ['EYES', 'visibility'],
])

defineProps<{ reactions: ReactionGroup[] }>()
</script>
