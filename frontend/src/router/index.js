import { createRouter, createWebHistory } from "vue-router"
import { nextTick } from 'vue'
import { i18n } from '../i18n'
import HomeView from "../views/HomeView.vue"
import BattleView from "../views/BattleView.vue"
import ResultView from "../views/ResultView.vue"

const supportedLocales = ['zh', 'ja', 'en']
const defaultLocale = 'zh'

// 从路径中提取语言
function getLocaleFromPath(path) {
  const match = path.match(/^\/(zh|ja|en)(\/|$)/)
  return match ? match[1] : null
}

const routes = [
  {
    path: '/:locale(zh|ja|en)?',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/:locale(zh|ja|en)?/battle',
    name: 'Battle',
    component: BattleView
  },
  {
    path: '/:locale(zh|ja|en)?/result',
    name: 'Result',
    component: ResultView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const localeInPath = getLocaleFromPath(to.path)
  
  if (localeInPath) {
    // 设置语言
    if (i18n.global.locale.value !== localeInPath) {
      i18n.global.locale.value = localeInPath
    }
    next()
  } else {
    // 没有语言前缀，重定向到默认语言
    const path = to.path === '/' ? '' : to.path
    next(`/${defaultLocale}${path}`)
  }
})

// 路由后置守卫，更新文档标题
router.afterEach((to) => {
  const localeInPath = getLocaleFromPath(to.path)
  if (localeInPath && i18n.global.locale.value !== localeInPath) {
    i18n.global.locale.value = localeInPath
  }
})

export default router
