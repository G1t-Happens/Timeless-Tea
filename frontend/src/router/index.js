import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import LandingPage from '@/views/LandingPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import MemberShip from '@/views/MemberShip.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import CreateArticle from '@/views/CreateArticle.vue'
import CreateCategory from '@/views/CreateCategory.vue'
import EditCategory from '@/views/EditCategory.vue'
import EditArticle from '@/views/EditArticle.vue'
import EditUser from '@/views/EditUser.vue'
import ViewOrder from '@/views/ViewOrder.vue'
import MessageView from '@/views/MessageView.vue'
import UserDashboard from '@/views/UserDashboard.vue'
import OrderDetail from '@/views/OrderDetail.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import ShoppingCart from '@/views/ShoppingCart.vue'
import CheckOut from '@/views/CheckOut.vue'
import OrderSuccess from '@/views/OrderSuccess.vue'
import ContactInfo from '@/views/ContactInfo.vue'
import ContactForm from '@/views/ContactForm.vue'
import ReturnAndExchange from '@/views/ReturnAndExchange.vue'
import FAQ from '@/views/FAQ.vue'
import LegalNotice from '@/views/LegalNotice.vue'
import PaymentShippingInfo from '@/views/PaymentShippingInfo.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'

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
    component: MemberShip,
    meta: { breadcrumb: 'membership' },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { breadcrumb: 'login' },
  },
  {
    path: '/admin',
    name: 'AdminDasboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true, breadcrumb: 'admin' },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/create-article',
    name: 'CreateArticle',
    component: CreateArticle,
    meta: { breadcrumb: 'create article', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/create-category',
    name: 'CreateCategory',
    component: CreateCategory,
    meta: { breadcrumb: 'create category', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/edit-category',
    name: 'EditCategory',
    component: EditCategory,
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
    component: EditArticle,
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
    component: EditUser,
    meta: { breadcrumb: 'edit user', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/order/:id',
    name: 'ViewOrder',
    component: ViewOrder,
    meta: { breadcrumb: 'view order', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/admin/message',
    name: 'Message',
    component: MessageView,
    meta: { breadcrumb: 'message', requiresAdmin: true },
    beforeEnter: adminGuard,
  },
  {
    path: '/user',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { breadcrumb: 'user', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/user/edit-user/',
    name: 'UserEditUser',
    component: EditUser,
    meta: { breadcrumb: 'edit user', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/user/order',
    name: 'OrderDetail',
    component: OrderDetail,
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
    component: ProductDetail,
    meta: { breadcrumb: 'product' },
  },
  {
    path: '/cart',
    name: 'ShoppingCart',
    component: ShoppingCart,
    meta: { breadcrumb: 'cart' },
  },
  {
    path: '/cart/checkout',
    name: 'CheckOut',
    component: CheckOut,
    meta: { breadcrumb: 'checkout', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/cart/checkout/success',
    name: 'OrderSuccess',
    component: OrderSuccess,
    props: (route) => ({ orderId: route.query.id }),
    meta: { breadcrumb: 'checkout success', requiresAuth: true },
    beforeEnter: authGuard,
  },
  {
    path: '/contact',
    name: 'ContactInfo',
    component: ContactInfo,
    meta: { breadcrumb: 'contact' },
  },
  {
    path: '/contact/contact_form',
    name: 'ContactForm',
    component: ContactForm,
    meta: { breadcrumb: 'contact form' },
  },
  {
    path: '/returns',
    name: 'Return',
    component: ReturnAndExchange,
    meta: { breadcrumb: 'returns & exchanges' },
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ,
    meta: { breadcrumb: 'faq' },
  },
  {
    path: '/impressum',
    name: 'Impressum',
    component: LegalNotice,
    meta: { breadcrumb: 'legal notice' },
  },
  {
    path: '/payment_shipping',
    name: 'PaymentShippingInfo',
    component: PaymentShippingInfo,
    meta: { breadcrumb: 'shipping and payment' },
  },
  {
    path: '/privacy',
    name: 'Privacy Policy',
    component: PrivacyPolicy,
    meta: { breadcrumb: 'privacy policy' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
