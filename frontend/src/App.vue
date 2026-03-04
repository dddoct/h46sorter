<template>
  <div class="app">
    <header class="header">
      <router-link to="/" class="logo">
        <span class="logo-text">N46</span>
        <span class="logo-suffix">Sorter</span>
      </router-link>
      <nav class="nav">
        <router-link to="/" class="nav-link" exact-active-class="active">{{ $t('nav.home') }}</router-link>
        <router-link to="/battle" class="nav-link" active-class="active">{{ $t('nav.battle') }}</router-link>
        <div class="lang-switcher">
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            :class="['lang-btn', { active: currentLocale === lang.code }]"
            @click="changeLocale(lang.code)"
          >
            {{ lang.label }}
          </button>
        </div>
      </nav>
    </header>
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const { locale } = useI18n()
    const currentLocale = ref(locale.value)

    const languages = [
      { code: 'zh', label: '中' },
      { code: 'ja', label: '日' },
      { code: 'en', label: 'En' }
    ]

    const changeLocale = (code) => {
      locale.value = code
      currentLocale.value = code
    }

    return {
      currentLocale,
      languages,
      changeLocale
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 50%, #16213e 100%);
  color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(15, 15, 30, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  color: #fff;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #7e1083 0%, #9c27b0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-suffix {
  font-size: 1.5rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: #fff;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #7e1083, #9c27b0);
  border-radius: 2px;
}

.lang-switcher {
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem;
  border-radius: 8px;
}

.lang-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: 500;
}

.lang-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.lang-btn.active {
  background: linear-gradient(135deg, #7e1083 0%, #9c27b0 100%);
  color: #fff;
}

.main {
  padding: 0;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .nav {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.85rem;
  }

  .lang-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
}
</style>
