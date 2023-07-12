<template>
  <div>
    <q-card>
      <QInput
        v-if="showInput"
        v-model="inputValue"
        type="text"
        dense
        filled
        @focus="showInput = false"
      />
      <template v-else>
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
            <QInput
              ref="writeInput"
              v-model="markdown"
              :autofocus="!defaultOpen"
              filled
              type="textarea"
            />
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
          <q-btn v-if="!defaultOpen" label="取消" @click="showInput = true" />
          <q-btn :label="submitBtnLabel" @click="buttonClick()" />
        </q-card-actions>
      </template>
    </q-card>
  </div>
</template>
<script setup lang="ts">
import { QInput } from 'quasar';
import { ref } from 'vue';
import Markdown from 'vue3-markdown-it';
import 'github-markdown-css';

const props = defineProps<{ submitBtnLabel: string; defaultOpen?: boolean }>();
const emit = defineEmits(['submit']);

const tab = ref('write');
const markdown = ref('');
const inputValue = ref('');
const showInput = ref(!props.defaultOpen);
const writeInput = ref(null as QInput | null);

function buttonClick() {
  if (markdown.value.trim().length > 0) {
    emit('submit', markdown.value);
    markdown.value = '';
  }
}
</script>
