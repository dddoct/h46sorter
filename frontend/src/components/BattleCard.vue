<template>
  <div class="card" @click="$emit('click')">
    <img :src="img" />
    <p>{{ name }}</p>
  </div>
</template>

<script>
export default {
  name: "BattleCard",
  props: {
    name: String,
    img: String
  }
}
</script>

<style scoped>
.card {
  cursor: pointer;
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.05);
}

.card img {
  width: 200px;
  border-radius: 10px;
}
</style>