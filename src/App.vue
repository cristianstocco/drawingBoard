<template>
  <div id="app">
    <DrawingArea />
  </div>
</template>

<script>
import DrawingArea from './components/DrawingArea.vue'

export default {
  name: 'app',
  components: {
    DrawingArea
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
body {
  margin: 0px;
}
body * {
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}
</style>
