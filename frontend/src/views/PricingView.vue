<template>
  <div style="background: #F8F9FF; min-height:100vh">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1A1A2E 0%,#16213E 100%); padding:80px 20px 60px; text-align:center">
      <div class="mb-4">
        <router-link to="/login" style="text-decoration:none; display:inline-flex; align-items:center; gap:8px; margin-bottom:32px">
          <div style="background:linear-gradient(135deg,#6C63FF,#a18cd1); border-radius:8px; padding:7px; line-height:1">
            <v-icon color="white" size="20">mdi-qrcode-scan</v-icon>
          </div>
          <span style="color:white; font-weight:800; font-size:1.1rem">ReviewFunnel</span>
        </router-link>
      </div>

      <h1 style="color:white; font-weight:900; font-size:2.8rem; letter-spacing:-0.5px; margin-bottom:16px">
        Simple, transparent pricing
      </h1>
      <p style="color:rgba(255,255,255,0.65); font-size:1.15rem; margin-bottom:32px; max-width:520px; margin-left:auto; margin-right:auto">
        Start free. Upgrade when you're ready to grow. No hidden fees, no contracts.
      </p>

      <div style="display:inline-flex; background:rgba(255,255,255,0.08); border-radius:50px; padding:4px">
        <button
          v-for="b in ['Monthly','Annually']" :key="b"
          style="padding:8px 24px; border-radius:50px; border:none; cursor:pointer; font-weight:700; font-size:0.9rem; transition:all 0.2s"
          :style="{
            background: billing === b.toLowerCase() ? 'white' : 'transparent',
            color: billing === b.toLowerCase() ? '#6C63FF' : 'rgba(255,255,255,0.6)'
          }"
          @click="billing = b.toLowerCase()"
        >
          {{ b }}
          <span v-if="b==='Annually'" style="background:#4CAF50; color:white; border-radius:50px; padding:2px 8px; font-size:0.7rem; margin-left:4px">-20%</span>
        </button>
      </div>
    </div>

    <!-- Pricing cards -->
    <v-container style="max-width:1100px; margin-top:-40px">
      <v-row>
        <v-col v-for="plan in plans" :key="plan.id" cols="12" md="4">
          <v-card
            rounded="xl"
            elevation="0"
            :style="{
              border: plan.popular ? '2px solid #6C63FF' : '1px solid #eee',
              overflow: 'visible',
              position: 'relative',
              transform: plan.popular ? 'translateY(-10px)' : 'none',
              boxShadow: plan.popular ? '0 20px 60px rgba(108,99,255,0.18)' : 'none',
              background: 'white'
            }"
          >
            <div
              v-if="plan.popular"
              style="position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,#6C63FF,#a18cd1); color:white; padding:5px 20px; border-radius:50px; font-size:0.75rem; font-weight:800; white-space:nowrap; letter-spacing:0.05em"
            >
              ⭐ MOST POPULAR
            </div>
            <v-card-text class="pa-7">
              <!-- Plan header -->
              <div class="mb-5">
                <div
                  style="width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:12px"
                  :style="{ background: plan.iconBg }"
                >
                  <v-icon :color="plan.iconColor" size="22">{{ plan.icon }}</v-icon>
                </div>
                <h3 style="font-size:1.3rem; font-weight:900; color:#1A1A2E">{{ plan.name }}</h3>
                <p style="color:#888; font-size:0.88rem; margin-top:4px">{{ plan.desc }}</p>
              </div>

              <!-- Price -->
              <div class="mb-6">
                <div style="display:flex; align-items:flex-end; gap:4px">
                  <span style="font-size:2.8rem; font-weight:900; color:#1A1A2E; line-height:1">
                    ${{ billing === 'annually' ? plan.annualPrice : plan.monthlyPrice }}
                  </span>
                  <span style="color:#888; margin-bottom:6px">/month</span>
                </div>
                <div v-if="plan.monthlyPrice > 0" style="font-size:0.8rem; color:#888; margin-top:4px">
                  {{ billing === 'annually' ? `Billed $${plan.annualPrice * 12}/year` : 'Billed monthly' }}
                </div>
                <div v-if="billing === 'annually' && plan.monthlyPrice > 0" style="color:#4CAF50; font-size:0.8rem; font-weight:700; margin-top:2px">
                  Save ${{ (plan.monthlyPrice - plan.annualPrice) * 12 }}/year
                </div>
              </div>

              <!-- CTA -->
              <v-btn
                :color="plan.popular ? 'primary' : 'default'"
                :variant="plan.popular ? 'flat' : 'tonal'"
                block
                rounded="lg"
                style="height:48px; font-weight:700; font-size:0.95rem; margin-bottom:24px"
                :to="plan.monthlyPrice === 0 ? '/register' : '/register'"
              >
                {{ plan.cta }}
              </v-btn>

              <v-divider class="mb-5" />

              <!-- Features -->
              <div v-for="feat in plan.features" :key="feat.text" class="d-flex align-start gap-2 mb-3" style="gap:10px">
                <v-icon
                  :color="feat.included ? (plan.popular ? 'primary' : 'success') : 'grey'"
                  size="18"
                  style="margin-top:1px; flex-shrink:0"
                >
                  {{ feat.included ? 'mdi-check-circle' : 'mdi-minus-circle-outline' }}
                </v-icon>
                <span style="font-size:0.9rem" :style="{ color: feat.included ? '#1A1A2E' : '#bbb' }">
                  {{ feat.text }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- FAQ / Feature comparison -->
      <div class="mt-12 mb-6 text-center">
        <h2 style="font-weight:900; font-size:2rem; color:#1A1A2E">Why ReviewFunnel?</h2>
        <p style="color:#888; max-width:540px; margin:12px auto 0">
          The Review Funnel System captures negative feedback privately while directing happy customers straight to Google — maximizing your star rating automatically.
        </p>
      </div>

      <v-row class="mb-8">
        <v-col v-for="benefit in benefits" :key="benefit.title" cols="12" sm="6" md="4">
          <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff; height:100%">
            <v-card-text class="pa-5">
              <div style="font-size:2rem" class="mb-2">{{ benefit.emoji }}</div>
              <h4 style="font-weight:700; color:#1A1A2E; margin-bottom:6px">{{ benefit.title }}</h4>
              <p style="color:#888; font-size:0.88rem; line-height:1.5">{{ benefit.desc }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div class="text-center pb-12">
        <p style="color:#888; margin-bottom:16px">Already have an account?</p>
        <router-link to="/login" style="color:#6C63FF; font-weight:700; text-decoration:none">
          Sign in to your dashboard →
        </router-link>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const billing = ref('monthly')

const plans = [
  {
    id: 'free', name: 'Free', desc: 'For solopreneurs getting started',
    monthlyPrice: 0, annualPrice: 0,
    icon: 'mdi-sprout', iconBg: '#e8f5e9', iconColor: 'success',
    popular: false,
    cta: 'Get started free',
    features: [
      { text: '1 QR code', included: true },
      { text: 'Review funnel landing page', included: true },
      { text: '50 scans per month', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'QR PNG download', included: true },
      { text: 'Private feedback inbox', included: false },
      { text: 'Unlimited QR codes', included: false },
      { text: 'Unlimited scans', included: false },
      { text: 'Printable poster download', included: false },
      { text: 'Remove ReviewFunnel branding', included: false },
      { text: 'Multiple locations', included: false },
      { text: 'Team members', included: false },
    ]
  },
  {
    id: 'pro', name: 'Pro', desc: 'For businesses serious about reviews',
    monthlyPrice: 29, annualPrice: 23,
    icon: 'mdi-rocket-launch', iconBg: '#ede7f6', iconColor: '#6C63FF',
    popular: true,
    cta: 'Start 14-day free trial',
    features: [
      { text: 'Unlimited QR codes', included: true },
      { text: 'Review funnel landing page', included: true },
      { text: 'Unlimited scans', included: true },
      { text: 'Full analytics + charts', included: true },
      { text: 'QR PNG + SVG + Poster PDF', included: true },
      { text: 'Private feedback inbox', included: true },
      { text: 'Reply to customer feedback', included: true },
      { text: 'Remove ReviewFunnel branding', included: true },
      { text: 'Custom brand color', included: true },
      { text: '1 location', included: true },
      { text: 'Team members', included: false },
      { text: 'API access', included: false },
    ]
  },
  {
    id: 'business', name: 'Business', desc: 'For multi-location businesses & agencies',
    monthlyPrice: 79, annualPrice: 63,
    icon: 'mdi-domain', iconBg: '#fff8e1', iconColor: '#f5a623',
    popular: false,
    cta: 'Start 14-day free trial',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited locations', included: true },
      { text: 'Unlimited QR codes', included: true },
      { text: 'Unlimited scans', included: true },
      { text: 'Advanced analytics + CSV export', included: true },
      { text: 'Full feedback inbox & replies', included: true },
      { text: 'Team members (up to 10)', included: true },
      { text: 'White-label branding', included: true },
      { text: 'API access', included: true },
      { text: 'Priority email + chat support', included: true },
      { text: 'Custom QR design', included: true },
      { text: 'Dedicated account manager', included: true },
    ]
  }
]

const benefits = [
  { emoji: '🚀', title: '30-second setup', desc: 'Create a review funnel QR code in under 30 seconds. No technical skills needed.' },
  { emoji: '⭐', title: 'More 5-star reviews', desc: 'Happy customers go straight to Google. Unhappy ones give private feedback — not public 1-stars.' },
  { emoji: '📊', title: 'Track what works', desc: 'See exactly how many scans turn into reviews with real-time conversion analytics.' },
  { emoji: '📨', title: 'Catch issues early', desc: 'Private feedback inbox lets you resolve problems before they become public complaints.' },
  { emoji: '🎨', title: 'Branded experience', desc: 'Customize the review landing page with your logo, colors and message.' },
  { emoji: '📍', title: 'Multi-location ready', desc: 'Manage QR codes and analytics for all your locations from one dashboard.' },
]
</script>
