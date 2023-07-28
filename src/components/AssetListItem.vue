<template>
  <q-card class="cursor-pointer" square @click="clickMod()">
    <q-responsive ratio="2">
      <div class="column justify-center">
        <q-img :src="asset.cover" alt="cover" />
      </div>
    </q-responsive>

    <q-card-section>
      <span class="text-h6 ellipsis-3-lines">{{ asset.name }}</span>

      <AssetBadges :asset="asset" />

      <span class="text-body1 text-weight-thin ellipsis-3-lines">
        {{ asset.description }}
      </span>

      <div class="text-weight-thin" style="font-size: small">
        <span>创建于: <DateFormatSpan :date="asset.created" /></span>

        <br />

        <span>更新于: <DateFormatSpan :date="asset.updated" /></span>
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Asset } from 'src/class/Types';
import AssetBadges from './AssetBadges.vue';
import DateFormatSpan from './DateFormatSpan.vue';

const router = useRouter();
const props = defineProps<{
  asset: Asset;
}>();

function clickMod() {
  router.push({ name: 'asset', params: { id: props.asset.id } });
}
</script>
