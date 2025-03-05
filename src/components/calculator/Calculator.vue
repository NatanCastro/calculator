<script setup lang="ts">
import CalcDisplay from './CalcDisplay.vue'
import CalcButton from './CalcButton.vue'
import { ref } from 'vue'
import { resolveAction, type Actions } from '../../action'
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

function handleButtonPress(event: Event) {
  event.preventDefault()
  const buttonValue = (event.target as HTMLElement).dataset['value'] as string
  const actionsList = actions.value
  resolveAction(actionsList, buttonValue, (number) => { result.value = Some(number) })
}
</script>

<template>
  <section id="calculator">
    <div id="display">
      <CalcDisplay :actions="actions" :result="result" />
    </div>
    <section id="buttons">
      <CalcButton v-for="(button, i) of buttons" :key="i" :class="{ enter: button == 'enter', button }" :value="button"
        :data-value="button" :action="handleButtonPress" />
    </section>
  </section>
</template>

<style scoped lang="scss">
#calculator {
  width: 350px;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #242424;
  padding: 1.5rem;
}

#display {
  width: 100%;
  min-height: 2rem;
  flex-grow: 1;
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
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .enter {
    grid-column: 5;
    grid-row: 4 / span 2;
  }
}

@media (max-width: 600px) {
  #calculator {
    gap: 1rem;
    padding: 1rem;
    width: 100vw;
    height: 100vh;
    padding: 1rem;
  }

  #buttons .button {
    padding: 1rem .5rem;
  }

}
</style>
