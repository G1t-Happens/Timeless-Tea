import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
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
      meta: { requiresAdmin: true },
      component: () => import('@/views/AdminDashboard.vue'),
    },
    {
      path: '/admin/create-article',
      name: 'CreateArticle',
      meta: { requiresAdmin: true },
      component: () => import('@/views/CreateArticle.vue'),
    },
    {
      path: '/admin/edit-article/:id',
      name: 'EditArticle',
      meta: { requiresAdmin: true },
      component: () => import('@/views/EditArticle.vue'),
    },
    {
      path: '/admin/edit-user/:id',
      name: 'EditUser',
      meta: { requiresAdmin: true },
      component: () => import('@/views/EditUser.vue'),
    },
    {
      path: '/user',
      name: 'UserDashboard',
      meta: { requiresAuth: true },
      component: () => import('@/views/UserDashboard.vue'),
    },
    {
      path: '/user/edit-user/:id',
      name: 'EditOwnProfile',
      meta: { requiresAuth: true },
      component: () => import('@/views/EditUser.vue'),
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  console.log('Check route....')
  const userStore = useUserStore()

  // Nutzer laden
  await userStore.fetchUser()

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    console.log('Must be logged...')
    if (userStore.user == null) {
      console.log('Unauthorized -> redirect to login')
      return next({ name: 'Login' })
    } else {
      return next()
    }
  }

  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    console.log('Must be admin ...')
    if (userStore.user == null || !userStore.user.isAdmin) {
      console.log('Unauthorized -> redirect to login')
      return next({ name: 'Login' })
    } else {
      return next()
    }
  }
  return next()
})

export default router
