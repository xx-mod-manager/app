<template>
  <q-page class="row justify-evenly">
    <q-pull-to-refresh @refresh="refresh">
      <template v-if="detail">
        <p>{{ detail.release.name }}</p>
        <p>{{ detail.release.description }}</p>
        <q-list>
          <q-item
            v-for="asset in detail.release.releaseAssets.nodes"
            :key="asset.name"
          >
            <p>{{ asset.name }} / {{ asset.downloadCount }}</p>
            <p>{{ asset.downloadUrl }}</p>
          </q-item>
        </q-list>
        <q-list>
          <q-item
            v-for="comment in detail.discussion?.comments.nodes"
            :key="comment.id"
          >
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
    </q-pull-to-refresh>
  </q-page>
</template>

<script setup lang="ts">
import { QPullToRefresh } from 'quasar';
import { getModDetail } from 'src/api/GraphqlApi';
import { Release, Discussion } from 'src/class/GraphqlClass';
import { useMainDataStore } from 'src/stores/MainData';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const mainDataStore = useMainDataStore();
const mod = mainDataStore.getMod(route.params.id as string);
let detail = ref(
  undefined as
    | { release: Release; discussion: Discussion | undefined }
    | undefined
);

if (mod) {
  getModDetail(mod).then((data) => {
    detail.value = data;
  });
}

async function refresh(done: () => void) {
  if (mod) {
    detail.value = await getModDetail(mod);
    done();
  }
}
</script>
