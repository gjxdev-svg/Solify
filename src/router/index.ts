import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' // Double check this path!

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../register.vue'),
    },
  ],
})

export default router
