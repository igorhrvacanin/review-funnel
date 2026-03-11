<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold" style="color:#1A1A2E">Billing & Plan</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Manage your subscription</p>
      </div>
    </div>

    <!-- Current plan -->
    <v-card rounded="xl" elevation="0" style="border:2px solid #6C63FF30; background:linear-gradient(135deg,#6C63FF08,#a18cd108)" class="mb-6">
      <v-card-text class="pa-6">
        <div class="d-flex align-center gap-4 mb-4" style="gap:16px">
          <v-icon size="36" color="primary">mdi-crown</v-icon>
          <div>
            <div class="text-h6 font-weight-black" style="color:#1A1A2E">
              {{ currentPlan.name }} Plan
              <v-chip color="success" size="small" variant="tonal" class="ml-2">Active</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ currentPlan.price === 0 ? 'Free forever' : `$${currentPlan.price}/month · Next billing: Apr 11, 2026` }}
            </div>
          </div>
        </div>

        <v-row dense>
          <v-col v-for="feat in currentPlan.highlights" :key="feat" cols="12" sm="6" md="4">
            <div class="d-flex align-center gap-2 text-body-2">
              <v-icon size="16" color="primary">mdi-check-circle</v-icon>
              {{ feat }}
            </div>
          </v-col>
        </v-row>

        <div class="d-flex gap-3 mt-5" style="gap:12px">
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-up-circle">Upgrade Plan</v-btn>
          <v-btn v-if="currentPlan.price > 0" variant="text" color="error" size="small">Cancel subscription</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Pricing Plans -->
    <h3 class="font-weight-bold mb-4" style="color:#1A1A2E">All Plans</h3>
    <v-row>
      <v-col v-for="plan in plans" :key="plan.id" cols="12" md="4">
        <v-card
          rounded="xl"
          elevation="0"
          :style="{
            border: plan.popular ? '2px solid #6C63FF' : '1px solid #f0f0ff',
            transform: plan.popular ? 'scale(1.02)' : 'none',
            position: 'relative',
            overflow: 'visible'
          }"
        >
          <div
            v-if="plan.popular"
            style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,#6C63FF,#a18cd1); color:white; padding:4px 16px; border-radius:50px; font-size:0.75rem; font-weight:700; white-space:nowrap"
          >
            ⭐ MOST POPULAR
          </div>
          <v-card-text class="pa-6">
            <div class="text-h6 font-weight-bold mb-1" style="color:#1A1A2E">{{ plan.name }}</div>
            <div class="mb-4">
              <span class="text-h3 font-weight-black" style="color:#1A1A2E">${{ plan.price }}</span>
              <span class="text-body-2 text-medium-emphasis">/month</span>
              <div v-if="plan.annual" class="text-caption text-success font-weight-medium">Save 20% · ${{ plan.annual }}/year</div>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ plan.desc }}</p>

            <v-btn
              :color="plan.popular ? 'primary' : plan.current ? 'success' : 'default'"
              :variant="plan.current ? 'tonal' : plan.popular ? 'flat' : 'tonal'"
              block
              :disabled="plan.current"
              class="mb-5"
              style="height:44px; font-weight:700"
            >
              {{ plan.current ? '✓ Current Plan' : plan.price === 0 ? 'Get Started Free' : `Upgrade to ${plan.name}` }}
            </v-btn>

            <v-divider class="mb-4" />

            <div v-for="feat in plan.features" :key="feat.text" class="d-flex align-center gap-2 mb-2" style="gap:8px">
              <v-icon :color="feat.included ? 'success' : 'grey'" size="16">
                {{ feat.included ? 'mdi-check-circle' : 'mdi-minus-circle-outline' }}
              </v-icon>
              <span class="text-body-2" :style="{ color: feat.included ? '#1A1A2E' : '#aaa' }">{{ feat.text }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Usage -->
    <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff" class="mt-6">
      <v-card-text class="pa-6">
        <h3 class="font-weight-bold mb-4" style="color:#1A1A2E">Usage This Month</h3>
        <v-row>
          <v-col v-for="u in usage" :key="u.label" cols="12" sm="6" md="3">
            <div class="mb-1 d-flex justify-space-between">
              <span class="text-body-2 font-weight-medium">{{ u.label }}</span>
              <span class="text-body-2 font-weight-bold">{{ u.used }}/{{ u.limit === Infinity ? '∞' : u.limit }}</span>
            </div>
            <v-progress-linear
              :model-value="u.limit === Infinity ? 0 : (u.used / u.limit) * 100"
              :color="(u.used / u.limit) > 0.8 ? 'warning' : 'primary'"
              rounded
              height="6"
              bg-color="#f0f0ff"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const planDefs = {
  free: {
    id: 'free', name: 'Free', price: 0, annual: null,
    desc: 'Perfect for trying out ReviewFunnel',
    highlights: ['1 QR code', 'Basic analytics', 'Review funnel'],
    features: [
      { text: '1 QR code', included: true },
      { text: 'Review funnel page', included: true },
      { text: 'Basic scan analytics', included: true },
      { text: '50 scans/month', included: true },
      { text: 'Private feedback inbox', included: false },
      { text: 'Unlimited QR codes', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Multiple locations', included: false },
      { text: 'Remove branding', included: false },
      { text: 'Team access', included: false },
    ]
  },
  pro: {
    id: 'pro', name: 'Pro', price: 29, annual: 278, popular: true,
    desc: 'For growing businesses serious about reviews',
    highlights: ['Unlimited QR codes', 'Full analytics', 'Feedback inbox', 'Poster downloads'],
    features: [
      { text: 'Unlimited QR codes', included: true },
      { text: 'Review funnel page', included: true },
      { text: 'Full scan analytics', included: true },
      { text: 'Unlimited scans', included: true },
      { text: 'Private feedback inbox', included: true },
      { text: 'Reply to feedback', included: true },
      { text: 'Advanced analytics', included: true },
      { text: '1 location', included: true },
      { text: 'Remove branding', included: true },
      { text: 'Team access', included: false },
    ]
  },
  business: {
    id: 'business', name: 'Business', price: 79, annual: 758,
    desc: 'For multi-location businesses & agencies',
    highlights: ['Everything in Pro', 'Multi-location', 'Team access', 'Priority support'],
    features: [
      { text: 'Unlimited QR codes', included: true },
      { text: 'Review funnel page', included: true },
      { text: 'Full scan analytics', included: true },
      { text: 'Unlimited scans', included: true },
      { text: 'Private feedback inbox', included: true },
      { text: 'Reply to feedback', included: true },
      { text: 'Advanced analytics + export', included: true },
      { text: 'Unlimited locations', included: true },
      { text: 'Remove branding', included: true },
      { text: 'Team access (5 users)', included: true },
    ]
  }
}

const currentPlan = computed(() => ({ ...planDefs[auth.plan] || planDefs.free, current: true }))

const plans = computed(() => ['free','pro','business'].map(id => ({
  ...planDefs[id],
  current: auth.plan === id
})))

const usage = computed(() => [
  { label: 'QR Codes', used: 3, limit: auth.plan === 'free' ? 1 : Infinity },
  { label: 'Monthly Scans', used: 282, limit: auth.plan === 'free' ? 50 : Infinity },
  { label: 'Feedback Entries', used: 13, limit: Infinity },
  { label: 'Locations', used: 2, limit: auth.plan === 'business' ? Infinity : auth.plan === 'pro' ? 1 : 1 },
])
</script>
