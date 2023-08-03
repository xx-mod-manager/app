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
import { useAuthDataStore } from 'src/stores/AuthData';
import { ref, toRefs } from 'vue';

const props = defineProps<{ author: Author }>();
const { author } = toRefs(props);

defineEmits(['update', 'delete']);
const authDataStore = useAuthDataStore();

const isCurrentUser = ref(authDataStore.user?.login == author.value.login);
</script>
