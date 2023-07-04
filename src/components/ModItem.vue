<template>
  <q-item>
    <q-item-section>
      <q-item-label>
        <router-link :to="to">{{ props.mod.name }}</router-link>
      </q-item-label>
      <q-item-label caption>{{ props.mod.description }}</q-item-label>
    </q-item-section>
  </q-item>
</template>
<script setup lang="ts">
import { Mod } from 'src/class/Mod';
import { ref } from 'vue';

const props = defineProps<{
  mod: Mod;
}>();
const to = ref(`/mod/${props.mod.mod_id}`);
</script>
