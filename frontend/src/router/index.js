import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import MemberShip from '@/views/MemberShip.vue'
import LoginPage from '@/views/LoginPage.vue'
import SearchResults from '@/components/SearchResults.vue'

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
      component: MemberShip,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
    },
    {
      path: '/search-results',
      name: 'search-results',
      component: SearchResults,
      props: route => ({ query: route.query.query }),
    },
  ],
})

export default router
