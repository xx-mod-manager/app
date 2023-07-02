<template>
  <q-page class="row justify-evenly">
    <q-pull-to-refresh @refresh="refresh" ref="pull">
      <q-list>
        <mod-item v-for="mod in mainDataStore.mods" :key="mod.id" :mod="mod" />
      </q-list>
    </q-pull-to-refresh>
  </q-page>
</template>

<script setup lang="ts">
import { QPullToRefresh } from 'quasar';
import ModItem from 'src/components/ModItem.vue';
import { useMainDataStore } from 'src/stores/mainData';
import { onMounted, ref } from 'vue';

const mainDataStore = useMainDataStore();
function refresh(done: () => void) {
  mainDataStore.updateData().finally(done);
}

const pull = ref<QPullToRefresh | null>(null);
onMounted(() => {
  pull.value?.trigger();
});
</script>
