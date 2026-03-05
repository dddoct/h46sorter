<template>
  <div class="app">
    <header class="header">
      <router-link :to="`/${currentLocale}`" class="logo">
        <span class="logo-text">H46</span>
        <span class="logo-suffix">Sorter</span>
      </router-link>
      <nav class="nav">
        <router-link :to="`/${currentLocale}`" class="nav-link" exact-active-class="active">{{ $t('nav.home') }}</router-link>
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
import { ref, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const { locale } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const currentLocale = ref(locale.value)

    const languages = [
      { code: 'zh', label: '中' },
      { code: 'ja', label: '日' },
      { code: 'en', label: 'En' }
    ]

    // 从路径中获取当前语言
    const getLocaleFromPath = (path) => {
      const match = path.match(/^\/(zh|ja|en)(\/|$)/)
      return match ? match[1] : 'zh'
    }

    // 监听路由变化，同步语言
    watch(() => route.path, (newPath) => {
      const pathLocale = getLocaleFromPath(newPath)
      if (pathLocale && pathLocale !== currentLocale.value) {
        currentLocale.value = pathLocale
        locale.value = pathLocale
      }
    }, { immediate: true })

    const changeLocale = (code) => {
      if (code === currentLocale.value) return
      
      locale.value = code
      currentLocale.value = code
      
      // 获取当前路径并替换语言前缀
      const currentPath = route.path
      const newPath = currentPath.replace(/^\/(zh|ja|en)/, `/${code}`)
      router.push(newPath)
    }

    // 提供当前语言给子组件
    provide('currentLocale', currentLocale)

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
  background: linear-gradient(135deg, #f5fcff 0%, #e8f8fc 50%, #ffffff 100%);
  color: #1a1a2e;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 153, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  color: #1a1a2e;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-suffix {
  font-size: 1.5rem;
  font-weight: 300;
  color: #1a1a2e;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: rgba(26, 26, 46, 0.7);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: #58bee4;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #58bee4, #7dd3f0);
  border-radius: 2px;
}

.lang-switcher {
  display: flex;
  gap: 0.25rem;
  background: rgba(88, 190, 228, 0.05);
  padding: 0.25rem;
  border-radius: 8px;
  border: 1px solid rgba(88, 190, 228, 0.1);
}

.lang-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  background: transparent;
  color: rgba(26, 26, 46, 0.6);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.lang-btn:hover {
  color: #58bee4;
  background: rgba(88, 190, 228, 0.1);
}

.lang-btn.active {
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  color: #fff;
}

.main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .nav {
    gap: 0.5rem;
  }

  .logo-text,
  .logo-suffix {
    font-size: 1.2rem;
  }

  .lang-switcher {
    gap: 0.1rem;
  }

  .lang-btn {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
