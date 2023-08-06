<template>
  <q-card class="cursor-pointer" square @click="clickResource()">
    <q-responsive ratio="2">
      <div class="column justify-center">
        <q-img :src="resource.cover" alt="cover" />
      </div>
    </q-responsive>

    <q-card-section>
      <span class="text-h6 ellipsis-3-lines">{{ resource.name }}</span>

      <ResourceBadges :resource="resource" />

      <span class="text-body1 text-weight-thin ellipsis-3-lines">
        {{ resource.description }}
      </span>

      <div class="text-weight-thin" style="font-size: small">
        <span>创建于: <DateFormatSpan :date="resource.created" /></span>

        <br />

        <span
          >更新于:
          <DateFormatSpan
            v-if="resource.updated != null"
            :date="resource.updated"
        /></span>
      </div>
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { Resource } from 'src/class/Resource';
import { ROUTE_RESOURCE } from 'src/router';
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';
import DateFormatSpan from './DateFormatSpan.vue';
import ResourceBadges from './ResourceBadges.vue';

const router = useRouter();
const props = defineProps<{
  resource: Resource;
}>();
const { resource } = toRefs(props);

function clickResource() {
  router.push({ name: ROUTE_RESOURCE, params: { id: resource.value.id } });
}
</script>
