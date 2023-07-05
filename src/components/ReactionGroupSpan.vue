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
  ['THUMBS_UP', 'fa-solid fa-thumbs-up'],
  ['LAUGH', 'fa-solid fa-face-laugh'],
  ['HOORAY', 'fa-regular fa-party-horn'],
  ['HEART', 'fa-solid fa-heart'],
  ['ROCKET', 'fa-solid fa-rocket'],
  ['EYES', 'fa-solid fa-eyes'],
])

defineProps<{ reactions: ReactionGroup[] }>()
</script>
