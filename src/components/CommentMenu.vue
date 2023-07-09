<template>
  <q-btn flat round :icon="matMoreHoriz">
    <q-menu>
      <q-list style="min-width: 2rem">
        <q-item
          v-if="isCurrentUser"
          v-close-popup
          clickable
          @click="$emit('update')"
        >
          <q-item-section>更新</q-item-section>
        </q-item>
        <q-item
          v-if="isCurrentUser"
          v-close-popup
          clickable
          @click="$emit('delete')"
        >
          <q-item-section>删除</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { matMoreHoriz } from '@quasar/extras/material-icons';
import { Author } from 'src/class/Types';
import { useMainDataStore } from 'src/stores/MainData';
import { ref } from 'vue';

const props = defineProps<{ author: Author }>();
defineEmits(['update', 'delete']);
const mainDataStore = useMainDataStore();

const isCurrentUser = ref(mainDataStore.user.login == props.author.login);
</script>
