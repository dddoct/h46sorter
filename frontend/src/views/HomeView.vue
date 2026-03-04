<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="logo-container">
        <div class="logo-icon">H46</div>
        <h1 class="main-title">{{ $t('home.welcome') }}</h1>
      </div>
      <h2 class="subtitle">{{ $t('home.subtitle') }}</h2>
      <p class="description">{{ $t('home.description') }}</p>
      
      <router-link to="/battle" class="start-button">
        <span class="button-text">{{ $t('home.startButton') }}</span>
        <span class="button-arrow">→</span>
      </router-link>
    </div>

    <div class="features-section">
      <h3 class="features-title">{{ $t('home.features.title') }}</h3>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h4>{{ $t('home.features.allMembers') }}</h4>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎭</div>
          <h4>{{ $t('home.features.formation') }}</h4>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📸</div>
          <h4>{{ $t('home.features.share') }}</h4>
        </div>
      </div>
    </div>

    <footer class="home-footer">
      <p>H46Sorter © 2026</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 3rem 1.5rem;
  background: linear-gradient(180deg, rgba(88, 190, 228, 0.08) 0%, transparent 50%);
}

.logo-container {
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 auto 1.5rem;
  box-shadow: 0 20px 40px rgba(88, 190, 228, 0.3);
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a2e 0%, #58bee4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.5rem;
  color: #1a1a2e;
  margin-bottom: 1rem;
  font-weight: 600;
}

.description {
  font-size: 1.1rem;
  color: rgba(26, 26, 46, 0.6);
  max-width: 500px;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.start-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(88, 190, 228, 0.4);
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(88, 190, 228, 0.5);
}

.button-arrow {
  transition: transform 0.3s;
}

.start-button:hover .button-arrow {
  transform: translateX(5px);
}

.features-section {
  padding: 3rem 1.5rem;
  background: rgba(88, 190, 228, 0.02);
}

.features-title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #1a1a2e;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(88, 190, 228, 0.1);
  box-shadow: 0 4px 20px rgba(88, 190, 228, 0.05);
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 1);
  border-color: rgba(88, 190, 228, 0.3);
  box-shadow: 0 10px 30px rgba(88, 190, 228, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h4 {
  font-size: 1rem;
  color: #1a1a2e;
  font-weight: 500;
}

.home-footer {
  text-align: center;
  padding: 2rem;
  color: rgba(26, 26, 46, 0.4);
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .logo-icon {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
