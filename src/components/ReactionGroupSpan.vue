<template>
  <span>
    <q-btn
      v-for="reaction in reactions"
      :key="reaction.content"
      size="0.5rem"
      unelevated
      rounded
      color="primary"
      style="padding: 0 0.5rem 0"
      @click="clickReaction(reaction)"
    >
      <q-icon :name="showIcon(reaction)" />
      <span
        v-if="reaction.totalCount > 0"
        style="font-size: 0.7rem; margin-left: 0.2rem"
        >{{ reaction.totalCount }}</span
      >
    </q-btn>
  </span>
</template>

<script setup lang="ts">
import {
  matCelebration,
  matEmojiEmotions,
  matFavorite,
  matHelpCenter,
  matRocketLaunch,
  matSentimentDissatisfied,
  matThumbDown,
  matThumbUp,
  matVisibility,
} from '@quasar/extras/material-icons';
import {
  outlinedCelebration,
  outlinedEmojiEmotions,
  outlinedFavoriteBorder,
  outlinedRocketLaunch,
  outlinedSentimentDissatisfied,
  outlinedThumbDown,
  outlinedThumbUp,
  outlinedVisibility,
} from '@quasar/extras/material-icons-outlined';
import { addReaction, removeReaction } from 'src/api/GraphqlApi';
import { ReactionGroup } from 'src/class/Types';
import { ref, toRefs } from 'vue';

const props = defineProps<{ reactions: ReactionGroup[] }>();
const { reactions } = toRefs(props);
const processing = ref(false);

function showIcon(reaction: ReactionGroup): string {
  const icon = reactionIcons.get(reaction.content);
  if (icon) {
    if (reaction.viewerHasReacted) {
      return icon.clickedIcon;
    } else {
      return icon.icon;
    }
  } else {
    return matHelpCenter;
  }
}

async function clickReaction(reaction: ReactionGroup) {
  if (processing.value) return;
  processing.value = true;

  let newReactionGroups;
  if (reaction.viewerHasReacted) {
    newReactionGroups = await removeReaction(
      reaction.subjectId,
      reaction.content
    );
  } else {
    newReactionGroups = await addReaction(reaction.subjectId, reaction.content);
  }

  processing.value = false;
  newReactionGroups.forEach((reactionGroup) => {
    const oldReactionGroup = reactions.value.find(
      (it) => it.content == reactionGroup.content
    );
    if (oldReactionGroup) {
      oldReactionGroup.totalCount = reactionGroup.totalCount;
      oldReactionGroup.viewerHasReacted = reactionGroup.viewerHasReacted;
    }
  });
}

const reactionIcons = new Map([
  ['THUMBS_UP', { icon: outlinedThumbUp, clickedIcon: matThumbUp }],
  ['THUMBS_DOWN', { icon: outlinedThumbDown, clickedIcon: matThumbDown }],
  ['LAUGH', { icon: outlinedEmojiEmotions, clickedIcon: matEmojiEmotions }],
  ['HOORAY', { icon: outlinedCelebration, clickedIcon: matCelebration }],
  [
    'CONFUSED',
    {
      icon: outlinedSentimentDissatisfied,
      clickedIcon: matSentimentDissatisfied,
    },
  ],
  ['HEART', { icon: outlinedFavoriteBorder, clickedIcon: matFavorite }],
  ['ROCKET', { icon: outlinedRocketLaunch, clickedIcon: matRocketLaunch }],
  ['EYES', { icon: outlinedVisibility, clickedIcon: matVisibility }],
]);
</script>
