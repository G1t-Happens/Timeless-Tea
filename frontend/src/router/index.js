import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LandingPage,
    },
    {
      path: '/member',
      name: 'MemberShip',
      component: () => import('@/views/MemberShip.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginPage.vue'),
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/AdminDashboard.vue'),
    },
    {
      path: '/admin/create-article',
      name: 'CreateArticle',
      component: () => import('@/views/CreateArticle.vue'),
    },
    {
      path: '/admin/edit-article/:id',
      name: 'EditArticle',
      component: () => import('@/views/EditArticle.vue'),
    },
  ],
})

export default router
