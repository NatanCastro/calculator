<script setup lang="ts">
import { Reactive, ref, Ref, computed, watchEffect } from 'vue'
import { Action, Actions, ActionType } from '../action/types'
import { Option } from 'ts-results'

const props = defineProps<{
  actions: Reactive<Actions>
  result: Reactive<Option<number>>
}>()

function stringifyActions() {
  return props.actions.reduce((acc, action) => {
    return acc.concat(action.value)
  }, "")
}

const expressionText = computed<string>(() => {
  return stringifyActions()
})

type ShowState = "expression" | "result"

const showState = ref<ShowState>("expression")

function changeShowState() {
  showState.value = showState.value == "expression" ? "result" : "expression"
}

watchEffect(() => {
  if (props.result.none) {
    showState.value = "expression"
  } else {
    showState.value = "result"
  }
});

</script>

<template>
  <div id="display" @click="changeShowState">
    <span v-if="result.none || showState == 'expression'">
      {{ expressionText }}
    </span>
    <span v-else>
      {{ result.unwrap() }}
    </span>
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
