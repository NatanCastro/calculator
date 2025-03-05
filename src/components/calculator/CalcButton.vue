<script setup lang="ts">
const props = defineProps<{
  value: string,
  action: (event: Event) => void
}>()
</script>

<template>
  <button @click="(event) => props.action(event)" class="button" :data-value="props.value">
    {{ value }}
  </button>
</template>
