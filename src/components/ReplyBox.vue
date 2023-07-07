<template>
  <div>
    <q-card>
      <q-input v-if="showInput" type="text" filled v-model="inputValue" @focus="showInput = false" />
      <template v-else>
        <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left"
          narrow-indicator>
          <q-tab name="write" label="回复" />
          <q-tab name="preview" label="预览" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="write">
            <q-input v-model="markdown" filled type="textarea" />
          </q-tab-panel>

          <q-tab-panel name="preview">
            <Markdown v-if="markdown.trim().length > 0" :source="markdown" />
            <p v-else>没有内容</p>
          </q-tab-panel>
        </q-tab-panels>
        <q-separator />
        <q-card-section align="right">
          <q-btn v-if="!defaultOpen" label="取消" @click="showInput = true" />
          <q-btn :label="submitBtnLabel" @click="buttonClick()" />
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Markdown from 'vue3-markdown-it';

const props = defineProps<{ submitBtnLabel: string, defaultOpen?: boolean }>()
const emit = defineEmits(['submit'])

const tab = ref('write')
const markdown = ref('')
const inputValue = ref('')
const showInput = ref(!props.defaultOpen)

function buttonClick() {
  if (markdown.value.trim().length > 0) {
    emit('submit', markdown.value)
    markdown.value = ''
  }
}
</script>
