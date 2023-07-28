<template>
  <q-card style="margin-bottom: 0.3rem">
    <q-card-section class="row">
      <div>
        <router-link
          v-if="asset.existOnline"
          :to="{ name: ROUTE_ASSET, params: { id: asset.id } }"
        >
          <span class="text-h6 ellipsis-3-lines">{{ asset.name }}</span>
        </router-link>

        <span v-else class="text-h6 ellipsis-3-lines">{{ asset.name }}</span>
      </div>

      <q-space />

      <div>
        <q-btn label="卸载" :disable="!installed" />
        <q-btn label="删除" />

        <q-btn
          flat
          :icon="expand ? matExpandLess : matExpandMore"
          @click="expand = !expand"
        />
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-section v-if="expand">
      <div
        v-for="version in versions"
        :key="version.version"
        class="col-12 row"
        style="margin-top: 0.2rem; padding: 0.5rem"
      >
        <div class="text-subtitle1 ellipsis-3-lines">{{ version.version }}</div>

        <q-space />

        <div>
          <q-btn
            label="安装"
            :disable="version.status != AssetStatus.DOWNLOADED"
          />

          <q-btn
            label="卸载"
            :disable="version.status != AssetStatus.INTALLED"
          />

          <q-btn label="删除" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { matExpandLess, matExpandMore } from '@quasar/extras/material-icons';
import { Asset, AssetStatus } from 'src/class/Types';
import { ROUTE_ASSET } from 'src/router';
import { computed, ref } from 'vue';

const props = defineProps<{
  asset: Asset;
}>();
const expand = ref(false);
const versions = computed(() => {
  const result = [] as { version: string; status: AssetStatus }[];
  props.asset.versions.forEach((status, version) => {
    if (status != AssetStatus.NONE) result.push({ version, status });
  });
  return result;
});
const installed = computed(() => {
  props.asset.versions.forEach((status) => {
    if (status == AssetStatus.INTALLED) return true;
  });
  return false;
});
</script>
