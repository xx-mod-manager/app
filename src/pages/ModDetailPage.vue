<template>
  <q-pull-to-refresh ref="pullRefresh" @refresh="refresh">
    <q-page class="fit row wrap justify-start items-start content-start" style="padding: 0.3rem;">
      <template v-if="detail">
        <ModDetail class="col" :release="detail.release" />
        <q-list>
          <q-item v-for="comment in detail.discussion?.comments.nodes" :key="comment.id">
            <p>{{ comment.body }}</p>
            <q-list>
              <q-item v-for="(replie, i) in comment.replies.nodes" :key="i">
                <p>{{ replie.body }}</p>
              </q-item>
            </q-list>
          </q-item>
        </q-list>
      </template>
      <template>
        <p>没获取到数据</p>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { QPullToRefresh, useQuasar } from 'quasar';
import { getModDetail } from 'src/api/GraphqlApi';
import { myLogger } from 'src/boot/logger';
import { Release, Discussion } from 'src/class/GraphqlClass';
import { useMainDataStore } from 'src/stores/MainData';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ModDetail from 'src/components/ModDetail.vue';

const route = useRoute();
const router = useRouter();
const mainDataStore = useMainDataStore();
const { loading } = useQuasar();
const mod = mainDataStore.getMod(route.params.id as string);
const detail = ref(
  undefined as
  | { release: Release; discussion: Discussion | undefined }
  | undefined
);

async function refresh(done: () => void) {
  if (mod) {
    myLogger.debug(`refresh mod detail ${mod?.mod_id}`);
    detail.value = await getModDetail(mod);
    if (loading.isActive) loading.hide();
    done();
  } else {
    if (loading.isActive) loading.hide();
    done();
    router.replace('/404');
  }
}

const pullRefresh = ref(null as QPullToRefresh | null);

onMounted(() => {
  if (pullRefresh.value) {
    loading.show();
    pullRefresh.value.trigger();
  }
});
</script>
