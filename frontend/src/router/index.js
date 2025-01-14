import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import LandingPage from '@/views/LandingPage.vue'

const authGuard = async (to, from, next) => {
  const userStore = useUserStore()
  await userStore.fetchUser()

  if (userStore.user == null || userStore.user === false) {
    return next({ name: 'Login' })
  }
  next()
}

const adminGuard = async (to, from, next) => {
  const userStore = useUserStore()
  await userStore.fetchUser()

  if (userStore.user == null || userStore.user === false || !userStore.user.isAdmin) {
    return next({ name: 'Login' })
  }
  next()
}

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage, meta: { breadcrumb: 'TeeShop' } },
  {
    path: '/member',
    name: 'MemberShip',
    component: () => import('@/views/MemberShip.vue'),
    meta: { breadcrumb: 'membership' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { breadcrumb: 'login' },
  },
  {
    path: '/admin',
    name: 'AdminDasboard',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { requiresAdmin: true, breadcrumb: 'admin' },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/create-article',
    name: 'CreateArticle',
    component: () => import('@/views/CreateArticle.vue'),
    meta: { breadcrumb: 'create article', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/create-category',
    name: 'CreateCategory',
    component: () => import('@/views/CreateCategory.vue'),
    meta: { breadcrumb: 'create category', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/edit-category',
    name: 'EditCategory',
    component: () => import('@/views/EditCategory.vue'),
    meta: { breadcrumb: 'edit category', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/edit-article/',
    redirect: '/admin',
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/edit-article/:id',
    name: 'EditArticle',
    component: () => import('@/views/EditArticle.vue'),
    meta: { breadcrumb: 'edit article', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/edit-user/',
    redirect: '/admin',
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/edit-user/:id',
    name: 'AdminEditUser',
    component: () => import('@/views/EditUser.vue'),
    meta: { breadcrumb: 'edit user', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/order/:id',
    name: 'ViewOrder',
    component: () => import('@/views/ViewOrder.vue'),
    meta: { breadcrumb: 'view order', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/message',
    name: 'Message',
    component: () => import('@/views/MessageView.vue'),
    meta: { breadcrumb: 'message', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/user',
    name: 'UserDashboard',
    component: () => import('@/views/UserDashboard.vue'),
    meta: { breadcrumb: 'user', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/user/edit-user/',
    name: 'UserEditUser',
    component: () => import('@/views/EditUser.vue'),
    meta: { breadcrumb: 'edit user', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/user/order',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { breadcrumb: 'orders', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/product',
    redirect: '/',
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { breadcrumb: 'product' },
  },
  {
    path: '/cart',
    name: 'ShoppingCart',
    component: () => import('@/views/ShoppingCart.vue'),
    meta: { breadcrumb: 'cart' },
  },
  {
    path: '/cart/checkout',
    name: 'CheckOut',
    component: () => import('@/views/CheckOut.vue'),
    meta: { breadcrumb: 'checkout', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/cart/checkout/success',
    name: 'OrderSuccess',
    component: () => import('@/views/OrderSuccess.vue'),
    props: (route) => ({ orderId: route.query.id }),
    meta: { breadcrumb: 'checkout success', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/contact',
    name: 'ContactInfo',
    component: () => import('@/views/ContactInfo.vue'),
    meta: { breadcrumb: 'contact' },
  },
  {
    path: '/contact/contact_form',
    name: 'ContactForm',
    component: () => import('@/views/ContactForm.vue'),
    meta: { breadcrumb: 'contact form' },
  },
  {
    path: '/returns',
    name: 'Return',
    component: () => import('@/views/ReturnAndExchange.vue'),
    meta: { breadcrumb: 'returns & exchanges' },
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('@/views/FAQ.vue'),
    meta: { breadcrumb: 'faq' },
  },
  {
    path: '/impressum',
    name: 'Impressum',
    component: () => import('@/views/LegalNotice.vue'),
    meta: { breadcrumb: 'legal notice' },
  },
  {
    path: '/payment_shipping',
    name: 'PaymentShippingInfo',
    component: () => import('@/views/PaymentShippingInfo.vue'),
    meta: { breadcrumb: 'shipping and payment' },
  },
  {
    path: '/privacy',
    name: 'Privacy Policy',
    component: () => import('@/views/PrivacyPolicy.vue'),
    meta: { breadcrumb: 'privacy policy' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
