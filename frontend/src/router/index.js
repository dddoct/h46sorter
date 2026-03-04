import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import BattleView from "../views/BattleView.vue"
import ResultView from "../views/ResultView.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView
  },
  {
    path: "/battle",
    name: "Battle",
    component: BattleView
  },
  {
    path: "/result",
    name: "Result",
    component: ResultView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
