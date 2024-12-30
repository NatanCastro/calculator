<script setup lang="ts">
import { Reactive, ref, computed } from 'vue'
import { Action, Actions, ActionType } from '../action/types'

const props = defineProps<{
  actions: Reactive<Actions>
}>()

function stringifyActions() {
  return props.actions.reduce((acc, action) => {
    return acc.concat(action.value)
  }, "")
}

const displayText = computed<string>(() => {
  return stringifyActions()
})

</script>

<template>
  <div id="display">
    {{ displayText }}
  </div>
</template>

<style scoped lang="scss">
#display {
  width: 100%;
  height: 80px;
  background-color: #332255;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
