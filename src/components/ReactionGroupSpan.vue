<template>
  <span>
    <q-btn size="0.5rem" v-for="reaction in reactions" :key="reaction.content" unelevated rounded color="primary"
      style="padding: 0 0.5rem 0;">
      <q-icon :name="showIcon(reaction)" />
      <span style="font-size: 0.7rem; margin-left: 0.2rem;" v-if="reaction.reactors.totalCount > 0">{{
        reaction.reactors.totalCount }}</span>
    </q-btn>
  </span>
</template>

<script setup lang="ts">
import { ReactionGroup } from 'src/class/GraphqlClass';
import { matThumbUp, matThumbDown, matEmojiEmotions, matCelebration, matSentimentDissatisfied, matFavorite, matRocketLaunch, matVisibility, matHelpCenter } from '@quasar/extras/material-icons'
import { outlinedThumbDownOffAlt, outlinedThumbDown, outlinedEmojiEmotions, outlinedCelebration, outlinedSentimentDissatisfied, outlinedFavoriteBorder, outlinedRocketLaunch, outlinedVisibility } from '@quasar/extras/material-icons-outlined'

defineProps<{ reactions: ReactionGroup[] }>()

const filledIconMap: Map<string, string[]> = new Map([
  ['THUMBS_UP', [outlinedThumbDownOffAlt, matThumbUp]],
  ['THUMBS_DOWN', [outlinedThumbDown, matThumbDown]],
  ['LAUGH', [outlinedEmojiEmotions, matEmojiEmotions]],
  ['HOORAY', [outlinedCelebration, matCelebration]],
  ['CONFUSED', [outlinedSentimentDissatisfied, matSentimentDissatisfied]],
  ['HEART', [outlinedFavoriteBorder, matFavorite]],
  ['ROCKET', [outlinedRocketLaunch, matRocketLaunch]],
  ['EYES', [outlinedVisibility, matVisibility]],
])

function showIcon(reaction: ReactionGroup): string {
  const icons = filledIconMap.get(reaction.content)

  if (icons) {
    if (reaction.viewerHasReacted) {
      return icons[1]
    } else {
      return icons[0]
    }
  } else {
    return matHelpCenter
  }
}
</script>
