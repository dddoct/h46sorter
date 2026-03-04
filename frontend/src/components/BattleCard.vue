<template>
  <div class="battle-card" @click="$emit('click')">
    <div class="card-image-wrapper">
      <img :src="img" :alt="name" class="card-image" />
    </div>
    <div class="card-info">
      <p class="card-name">{{ name }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "BattleCard",
  props: {
    name: {
      type: String,
      required: true
    },
    img: {
      type: String,
      required: true
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.battle-card {
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid transparent;
  width: 280px;
}

.battle-card:hover {
  transform: scale(1.05) translateY(-5px);
  border-color: #7e1083;
  box-shadow: 0 20px 40px rgba(126, 16, 131, 0.3);
}

.card-image-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.battle-card:hover .card-image {
  transform: scale(1.1);
}

.card-info {
  padding: 1rem;
  text-align: center;
}

.card-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}
</style>
