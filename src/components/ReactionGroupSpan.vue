<template>
  <span>
    <q-btn size="0.5rem" v-for="reaction in reactions" :key="reaction.content" unelevated rounded color="primary"
      style="padding: 0 0.5rem 0;" @click="clickReaction(reaction)">
      <q-icon :name="showIcon(reaction)" />
      <span style="font-size: 0.7rem; margin-left: 0.2rem;" v-if="reaction.reactors.totalCount > 0">{{
        reaction.reactors.totalCount }}</span>
    </q-btn>
  </span>
</template>

<script setup lang="ts">
import { ReactionGroup } from 'src/class/GraphqlClass';
import { matThumbUp, matThumbDown, matEmojiEmotions, matCelebration, matSentimentDissatisfied, matFavorite, matRocketLaunch, matVisibility, matHelpCenter } from '@quasar/extras/material-icons'
import { outlinedThumbUp, outlinedThumbDown, outlinedEmojiEmotions, outlinedCelebration, outlinedSentimentDissatisfied, outlinedFavoriteBorder, outlinedRocketLaunch, outlinedVisibility } from '@quasar/extras/material-icons-outlined'
import { addReaction, removeReaction } from 'src/api/GraphqlApi';

const props = defineProps<{ reactions: ReactionGroup[] }>()
const filledIconMap: Map<string, string[]> = new Map([
  ['THUMBS_UP', [outlinedThumbUp, matThumbUp]],
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

async function clickReaction(reaction: ReactionGroup) {
  let newReactionGroups;

  if (reaction.viewerHasReacted) {
    newReactionGroups = await removeReaction(reaction.subject.id, reaction.content)
  } else {
    newReactionGroups = await addReaction(reaction.subject.id, reaction.content)
  }

  newReactionGroups.forEach((reactionGroup) => {
    const oldReactionGroup = props.reactions.find((it) => it.content == reactionGroup.content)

    if (oldReactionGroup) {
      oldReactionGroup.reactors.totalCount = reactionGroup.reactors.totalCount;
      oldReactionGroup.viewerHasReacted = reactionGroup.viewerHasReacted
    }
  })
}
</script>
