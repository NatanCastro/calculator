<script setup lang="ts">
import Calculator from './components/calculator/Calculator.vue'
</script>

<template>
  <div id="main">
    <div id="bg-image">
      <img src="/background-image.jpg" alt="background-image" />
    </div>
    <Calculator />
  </div>
</template>

<style scoped lang="scss">
#main {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: grid;
  justify-content: center;
  align-content: center;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

#bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;

  img {
    width: inherit;
    height: inherit;
    object-fit: cover;
    object-position: center;
    filter: brightness(80%);
  }
}
</style>
