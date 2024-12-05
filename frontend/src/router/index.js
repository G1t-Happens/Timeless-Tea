import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import MemberShip from '@/views/MemberShip.vue'
import LoginPage from '@/views/LoginPage.vue'
import SearchResults from '@/components/SearchResults.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import CreateArticle from '@/components/CreateArticle.vue'
import EditArticle from '@/views/EditArticle.vue'

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
      props: (route) => ({ query: route.query.query }),
    },
    {
      path: '/admin',
      name: 'Admin',
      component: AdminDashboard,
    },
    {
      path: '/admin/create-article',
      name: 'CreateArticle',
      component: CreateArticle,
    },
    {
      path: '/admin/edit-article/:id',
      name: 'EditArticle',
      component: EditArticle,
      props: true,
    },
  ],
})

export default router
