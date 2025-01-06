<script setup lang="ts">
import CalcDisplay from './CalcDisplay.vue'
import CalcButton from './CalcButton.vue'
import { ref, reactive, Reactive, watchEffect } from 'vue'
import { resolveAction, Action, Actions, ActionType } from '../action'
import { Option, None, Some } from 'ts-results'

const buttons = ref([
  'del', '(', ')', 'mod', 'π',
  '7', '8', '9', '/', '√',
  '4', '5', '6', '*', '^',
  '1', '2', '3', '-',
  '0', ',', '%', '+', 'enter'
])

const actions = ref<Actions>([])

const result = ref<Option<number>>(None)

function handleButtonPress(event: PointerEvent) {
  event.preventDefault()
  const buttonValue = (event.target as HTMLElement).dataset['value']
  const actionsList = actions.value
  resolveAction(actionsList, buttonValue, (number: number) => { result.value = Some(number) })
}
</script>
<template>
  <section id="app">
    <CalcDisplay :actions="actions" :result="result" />
    <section id="buttons">
      <CalcButton v-for="(button, i) of buttons" :key="i" :class="{ enter: button == 'enter', button }" :value="button"
        :data-value="button" :action="handleButtonPress" />
    </section>
  </section>
</template>

<style scoped lang="scss">
#app {
  width: 800px;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#buttons {
  width: 100%;
  display: grid;
  grid-template-rows: repeat(5, auto);
  grid-template-columns: repeat(5, auto);
  gap: .5rem;

  .button {
    background-color: #332255;
    border-radius: 8px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .enter {
    grid-column: 5;
    grid-row: 4 / span 2;
  }
}
</style>
