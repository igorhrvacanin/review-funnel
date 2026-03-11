<template>
  <v-app>
    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="sidebar-nav" color="#1A1A2E">
      <!-- Logo -->
      <div class="pa-4 d-flex align-center" style="gap:12px; min-height:64px">
        <div style="background: linear-gradient(135deg,#6C63FF,#a18cd1); border-radius:10px; padding:8px; min-width:36px; height:36px; display:flex; align-items:center; justify-content:center">
          <v-icon color="white" size="20">mdi-qrcode-scan</v-icon>
        </div>
        <transition name="fade">
          <div v-if="!rail">
            <div style="color:#fff; font-weight:800; font-size:1rem; letter-spacing:-0.3px">ReviewFunnel</div>
            <div style="color:#6C63FF; font-size:0.7rem; font-weight:600; letter-spacing:0.08em">QR REVIEW SYSTEM</div>
          </div>
        </transition>
      </div>

      <v-divider color="#ffffff15" />

      <!-- Plan badge -->
      <div v-if="!rail" class="px-4 py-3">
        <v-chip :color="planColor" size="small" variant="tonal" class="font-weight-bold">
          <v-icon start size="14">mdi-crown</v-icon>
          {{ auth.plan.toUpperCase() }} PLAN
        </v-chip>
      </div>

      <!-- Navigation Items -->
      <v-list nav density="compact" class="mt-1">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="rail ? '' : item.title"
          rounded="lg"
          active-color="primary"
          color="#FFFFFF80"
          class="mb-1"
        >
          <template v-if="item.badge && !rail" #append>
            <span class="unread-badge">{{ item.badge }}</span>
          </template>
        </v-list-item>
      </v-list>

      <template #append>
        <v-divider color="#ffffff15" />
        <v-list nav density="compact" class="pa-2">
          <v-list-item
            prepend-icon="mdi-logout"
            :title="rail ? '' : 'Sign Out'"
            color="#FFFFFF80"
            rounded="lg"
            @click="handleLogout"
          />
          <v-list-item
            :prepend-icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            :title="rail ? '' : 'Collapse'"
            color="#FFFFFF80"
            rounded="lg"
            @click="rail = !rail"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Top App Bar -->
    <v-app-bar flat color="white" border="b" height="64">
      <v-app-bar-title>
        <span class="font-weight-bold" style="color:#1A1A2E">{{ pageTitle }}</span>
      </v-app-bar-title>
      <template #append>
        <v-btn
          color="primary"
          variant="tonal"
          class="mr-2"
          prepend-icon="mdi-plus"
          size="small"
          to="/dashboard/qr-codes/new"
        >
          New QR Code
        </v-btn>
        <v-avatar color="primary" size="36" class="mr-3" style="cursor:pointer">
          <span class="text-caption font-weight-bold">{{ userInitials }}</span>
        </v-avatar>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-main style="background:#F8F9FF; min-height:100vh">
      <v-container fluid class="pa-6">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFeedbackStore } from '@/stores/feedback'

const auth = useAuthStore()
const feedbackStore = useFeedbackStore()
const route = useRoute()
const router = useRouter()

const drawer = ref(true)
const rail = ref(false)

const unreadFeedback = computed(() => feedbackStore.unreadCount())

const navItems = computed(() => [
  { to: '/dashboard', icon: 'mdi-view-dashboard-outline', title: 'Dashboard' },
  { to: '/dashboard/qr-codes', icon: 'mdi-qrcode', title: 'QR Codes' },
  { to: '/dashboard/analytics', icon: 'mdi-chart-line', title: 'Analytics' },
  { to: '/dashboard/feedback', icon: 'mdi-message-text-outline', title: 'Feedback Inbox', badge: unreadFeedback.value || null },
  { to: '/dashboard/locations', icon: 'mdi-map-marker-multiple-outline', title: 'Locations' },
  { to: '/dashboard/profile', icon: 'mdi-storefront-outline', title: 'Business Profile' },
  { to: '/dashboard/billing', icon: 'mdi-credit-card-outline', title: 'Billing & Plan' },
])

const pageTitle = computed(() => {
  const map = {
    '/dashboard': 'Dashboard',
    '/dashboard/qr-codes': 'QR Codes',
    '/dashboard/qr-codes/new': 'Create QR Code',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/feedback': 'Feedback Inbox',
    '/dashboard/locations': 'Locations',
    '/dashboard/profile': 'Business Profile',
    '/dashboard/billing': 'Billing & Plan',
  }
  return map[route.path] || 'ReviewFunnel'
})

const userInitials = computed(() => {
  const name = auth.user?.name || auth.user?.email || 'U'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const planColor = computed(() => ({ free: 'grey', pro: 'primary', business: 'warning' }[auth.plan] || 'grey'))

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.page-fade-enter-from { opacity: 0; transform: translateY(10px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
