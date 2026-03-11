<template>
  <div class="funnel-container">
    <div class="funnel-card text-center" style="max-width:420px">
      <div style="font-size:4rem" class="mb-4">{{ type === 'review' ? '🌟' : '💙' }}</div>
      <h2 class="text-h5 font-weight-bold mb-2" style="color:#1A1A2E">{{ headline }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6" style="line-height:1.6">{{ subtext }}</p>

      <div v-if="type === 'review'" style="background:#f8f9ff; border-radius:16px; padding:16px; margin-bottom:24px">
        <div class="text-body-2 font-weight-medium mb-2">Share your review with friends too!</div>
        <div class="d-flex justify-center gap-3" style="gap:12px">
          <v-btn icon size="small" color="#1877F2" variant="tonal">
            <v-icon>mdi-facebook</v-icon>
          </v-btn>
          <v-btn icon size="small" color="#1DA1F2" variant="tonal">
            <v-icon>mdi-twitter</v-icon>
          </v-btn>
          <v-btn icon size="small" color="#25D366" variant="tonal">
            <v-icon>mdi-whatsapp</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-if="type === 'feedback'" style="background:#f0fff4; border-radius:16px; padding:16px; margin-bottom:24px; border:1px solid #c6f6d5">
        <v-icon color="success" class="mb-2">mdi-shield-check-outline</v-icon>
        <div class="text-body-2 font-weight-medium text-success">Your feedback has been sent privately</div>
        <div class="text-caption text-medium-emphasis mt-1">A manager will review it within 24 hours</div>
      </div>

      <button
        style="width:100%; background:linear-gradient(135deg,#6C63FF,#a18cd1); color:white; border:none; border-radius:14px; padding:14px; font-size:0.95rem; font-weight:700; cursor:pointer"
        @click="$router.push('/')"
      >
        Done ✓
      </button>

      <p class="text-caption text-medium-emphasis mt-4" style="opacity:0.5">Powered by ReviewFunnel</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const type = route.query.type || 'review'

const headline = computed(() =>
  type === 'review' ? 'Thank you for your review! ⭐' : 'Thank you for your feedback!'
)
const subtext = computed(() =>
  type === 'review'
    ? "Your review makes a huge difference for us and helps other customers find us. We truly appreciate it!"
    : "We take every piece of feedback seriously. We'll work on improving based on what you shared."
)
</script>
