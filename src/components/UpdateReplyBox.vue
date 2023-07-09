<template>
  <div>
    <q-card>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="write" label="回复" />
        <q-tab name="preview" label="预览" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="write">
          <QInput v-model="markdown" filled type="textarea" />
        </q-tab-panel>

        <q-tab-panel name="preview">
          <Markdown
            v-if="markdown.trim().length > 0"
            class="markdown-body"
            :source="markdown"
          />
          <p v-else>没有内容</p>
        </q-tab-panel>
      </q-tab-panels>
      <q-separator />
      <q-card-actions align="right">
        <q-btn label="取消" @click="$emit('cancel')" />
        <q-btn label="更新" @click="buttonClick()" />
      </q-card-actions>
    </q-card>
  </div>
</template>
<script setup lang="ts">
import { QInput } from 'quasar';
import { ref } from 'vue';
import Markdown from 'vue3-markdown-it';
import 'github-markdown-css';

const props = defineProps<{ oldValue: string }>();
const emit = defineEmits(['submit', 'cancel']);

const tab = ref('write');
const markdown = ref(props.oldValue);

function buttonClick() {
  if (markdown.value.trim().length > 0) {
    emit('submit', markdown.value);
    markdown.value = '';
  }
}
</script>
