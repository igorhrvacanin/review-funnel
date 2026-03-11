import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Public routes
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },
  { path: '/pricing', name: 'Pricing', component: () => import('@/views/PricingView.vue'), meta: { guest: true } },

  // Review Funnel (public, accessible via QR scan)
  { path: '/r/:code', name: 'ReviewFunnel', component: () => import('@/views/funnel/ReviewFunnelView.vue'), meta: { public: true } },
  { path: '/r/:code/feedback', name: 'FeedbackForm', component: () => import('@/views/funnel/FeedbackFormView.vue'), meta: { public: true } },
  { path: '/r/:code/thanks', name: 'ThankYou', component: () => import('@/views/funnel/ThankYouView.vue'), meta: { public: true } },

  // Protected app routes (dashboard)
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/dashboard/DashboardHomeView.vue') },
      { path: 'qr-codes', name: 'QRCodes', component: () => import('@/views/dashboard/QRCodesView.vue') },
      { path: 'qr-codes/new', name: 'NewQRCode', component: () => import('@/views/dashboard/NewQRCodeView.vue') },
      { path: 'analytics', name: 'Analytics', component: () => import('@/views/dashboard/AnalyticsView.vue') },
      { path: 'feedback', name: 'Feedback', component: () => import('@/views/dashboard/FeedbackInboxView.vue') },
      { path: 'locations', name: 'Locations', component: () => import('@/views/dashboard/LocationsView.vue') },
      { path: 'profile', name: 'Profile', component: () => import('@/views/dashboard/ProfileView.vue') },
      { path: 'billing', name: 'Billing', component: () => import('@/views/dashboard/BillingView.vue') },
    ]
  },

  // 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  if (to.meta.guest && auth.isLoggedIn) {
    return next({ name: 'Dashboard' })
  }
  next()
})

export default router
