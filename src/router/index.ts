import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' // Double check this path!

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // NOTE: this used to share the name 'home' with the /home route below.
      // Vue Router requires unique names — renamed to 'landing' to fix it.
      path: '/',
      name: 'landing',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/loginPage.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/registerPage.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/homePage.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/placeholderPage.vue'),
      props: { title: 'Search' },
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('../views/placeholderPage.vue'),
      props: { title: 'New post' },
    },
    {
      path: '/reels',
      name: 'reels',
      component: () => import('../views/placeholderPage.vue'),
      props: { title: 'Reels' },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/placeholderPage.vue'),
      props: { title: 'Notifications' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/placeholderPage.vue'),
      props: { title: 'Profile' },
    },
    {
      path: '/music',
      name: 'music',
      component: () => import('../views/MusicPage.vue'),
    },
  ],
})

export default router
