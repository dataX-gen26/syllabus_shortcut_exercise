import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../views/index.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/shortcuts/test.vue'),
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/shortcuts/practice.vue'),
    },
  ],
})

export default router
