<template>
  <span>
    {{ dateUtil.formatDate(date, 'YY/MM/DD HH:mm:ss') }}
  </span>
</template>
<script setup lang="ts">
import { date as dateUtil } from 'quasar';

defineProps<{
  date: Date | string;
}>();
</script>
