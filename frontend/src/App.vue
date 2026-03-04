<template>
  <div class="app">
    <h1>N46 Sorter</h1>
  </div>
</template>

<script>
import BattleCard from "./components/BattleCard.vue"
import { members } from "./data/members.js"

export default {
  components: { BattleCard },
  data() {
    return {
      members: []
    }
  }
}
</script>

<style>
.app {
  text-align: center;
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
