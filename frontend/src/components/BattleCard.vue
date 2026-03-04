<template>
  <div class="battle-card" @click="$emit('click')">
    <div class="card-image-wrapper">
      <img 
        :src="img" 
        :alt="name" 
        class="card-image" 
        referrerpolicy="no-referrer"
        @error="handleImageError"
      />
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
  emits: ['click'],
  setup() {
    const handleImageError = (e) => {
      console.error('图片加载失败:', e.target.src)
      // 可以设置一个默认占位图
      // e.target.src = '/default-avatar.png'
    }
    
    return {
      handleImageError
    }
  }
}
</script>

<style scoped>
.battle-card {
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid transparent;
  width: 280px;
  box-shadow: 0 4px 20px rgba(88, 190, 228, 0.1);
}

.battle-card:hover {
  transform: scale(1.05) translateY(-5px);
  border-color: #58bee4;
  box-shadow: 0 20px 40px rgba(88, 190, 228, 0.3);
}

.card-image-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  display: block;
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
  color: #1a1a2e;
  margin: 0;
}
</style>
