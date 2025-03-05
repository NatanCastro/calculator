<script setup lang="ts">
import { type Reactive, ref, computed, watchEffect } from 'vue'
import { type Actions } from '../../action'
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
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #332255;
  border-radius: 8px;
  padding: 8px;

  span {
    word-break: break-all;
  }
}
</style>
