<script setup lang="ts">
const props = defineProps<{
  value: string,
  action: (event: Event) => void
}>()
</script>

<template>
  <button @click="(event) => action(event)" class="button" :data-value="value">
    {{ value }}
  </button>
</template>
