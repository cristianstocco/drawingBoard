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
body {
  margin: 0px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
