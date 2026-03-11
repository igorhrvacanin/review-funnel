<template>
  <div class="funnel-container">
    <!-- Loading -->
    <div v-if="loading" class="text-center" style="color:white">
      <v-progress-circular indeterminate color="white" size="48" />
      <p class="mt-4">Loading...</p>
    </div>

    <!-- Main Funnel Card -->
    <div v-else class="funnel-card">
      <!-- Business branding -->
      <div class="mb-5">
        <div style="width:64px; height:64px; border-radius:16px; margin:0 auto 16px; display:flex; align-items:center; justify-content:center"
          :style="{ background: `linear-gradient(135deg, ${brandColor}, ${darken(brandColor)})` }">
          <v-icon color="white" size="28">mdi-storefront</v-icon>
        </div>
        <h2 class="text-h6 font-weight-black mb-1" style="color:#1A1A2E">{{ businessName }}</h2>
        <p class="text-body-2 text-medium-emphasis">Thank you for visiting us!</p>
      </div>

      <v-divider class="mb-5" />

      <!-- Question -->
      <h3 class="text-h5 font-weight-bold mb-2" style="color:#1A1A2E">
        {{ pageTitle }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Your feedback means a lot to us 💙
      </p>

      <!-- Sentiment Buttons -->
      <div>
        <button class="sentiment-btn sentiment-great" @click="selectSentiment('great')">
          <span style="font-size:1.4rem">🙂</span>
          &nbsp; Great — I loved it!
        </button>
        <button class="sentiment-btn sentiment-okay" @click="selectSentiment('okay')">
          <span style="font-size:1.4rem">😐</span>
          &nbsp; Okay — Could be better
        </button>
        <button class="sentiment-btn sentiment-bad" @click="selectSentiment('bad')">
          <span style="font-size:1.4rem">🙁</span>
          &nbsp; Bad — I had an issue
        </button>
      </div>

      <!-- Powered by -->
      <p class="text-caption text-medium-emphasis mt-6" style="opacity:0.5">
        Powered by ReviewFunnel
      </p>
    </div>

    <!-- Great selected: redirect overlay -->
    <v-dialog v-model="showRedirectOverlay" persistent max-width="380">
      <v-card rounded="xl">
        <v-card-text class="pa-8 text-center">
          <div style="font-size:3rem" class="mb-3">🌟</div>
          <h3 class="text-h6 font-weight-bold mb-2">Fantastic!</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            We're so glad you had a great experience!<br>
            Would you mind leaving us a quick Google review?<br>
            It takes less than a minute and means the world to us. 🙏
          </p>
          <v-btn
            color="primary"
            size="large"
            block
            :href="googleReviewUrl"
            target="_blank"
            prepend-icon="mdi-google"
            style="height:52px; font-weight:700; margin-bottom:12px"
            @click="trackReviewClick"
          >
            Leave a Google Review ⭐
          </v-btn>
          <v-btn variant="text" size="small" @click="showRedirectOverlay=false" color="medium-emphasis">
            No thanks, maybe later
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const showRedirectOverlay = ref(false)

// Mock QR data lookup (in production: fetch from API via shortCode)
const mockQRData = {
  abc123: { businessName: 'The Corner Café', pageTitle: 'How was your experience?', brandColor: '#6C63FF', googleReviewUrl: 'https://g.page/r/demo-business/review' },
  xyz789: { businessName: 'The Corner Café', pageTitle: 'How was your experience at our table?', brandColor: '#FF6584', googleReviewUrl: 'https://g.page/r/demo-business/review' },
  def456: { businessName: 'The Corner Café — Westside', pageTitle: 'Tell us about your visit!', brandColor: '#4CAF50', googleReviewUrl: 'https://g.page/r/demo-business/review' },
}

const code = route.params.code
const qrData = mockQRData[code] || {
  businessName: 'Local Business',
  pageTitle: 'How was your experience?',
  brandColor: '#6C63FF',
  googleReviewUrl: 'https://google.com'
}

const businessName = ref(qrData.businessName)
const pageTitle = ref(qrData.pageTitle)
const brandColor = ref(qrData.brandColor)
const googleReviewUrl = ref(qrData.googleReviewUrl)

onMounted(async () => {
  // Track QR scan
  await new Promise(r => setTimeout(r, 500))
  // In production: POST /api/analytics/scan { code, userAgent, timestamp }
  loading.value = false
})

function selectSentiment(sentiment) {
  if (sentiment === 'great') {
    // Track "great" selection
    // In production: POST /api/analytics/sentiment { code, sentiment: 'great' }
    showRedirectOverlay.value = true
  } else {
    // Redirect to private feedback form
    // In production: POST /api/analytics/sentiment { code, sentiment }
    router.push({ name: 'FeedbackForm', params: { code }, query: { sentiment } })
  }
}

function trackReviewClick() {
  // In production: POST /api/analytics/review-click { code }
  setTimeout(() => {
    router.push({ name: 'ThankYou', params: { code }, query: { type: 'review' } })
  }, 2000)
}

function darken(hex) {
  if (!hex || hex.length < 7) return '#333'
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - 50)
  const g = Math.max(0, ((n >> 8) & 0xff) - 50)
  const b = Math.max(0, (n & 0xff) - 50)
  return `#${[r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')}`
}
</script>
