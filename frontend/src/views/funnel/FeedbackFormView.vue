<template>
  <div class="funnel-container">
    <div class="funnel-card" style="max-width: 520px">
      <!-- Back button -->
      <div class="text-left mb-4">
        <button
          style="background:none; border:none; cursor:pointer; color:#6C63FF; font-weight:600; font-size:0.9rem; display:flex; align-items:center; gap:4px"
          @click="$router.back()"
        >
          ← Go back
        </button>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <div style="font-size:2.5rem" class="mb-3">{{ sentimentEmoji }}</div>
        <h3 class="text-h6 font-weight-bold mb-1" style="color:#1A1A2E">
          {{ sentimentHeadline }}
        </h3>
        <p class="text-body-2 text-medium-emphasis">
          {{ sentimentSubtext }}
        </p>
      </div>

      <!-- Feedback Form -->
      <v-form @submit.prevent="submitFeedback">
        <!-- Star Rating -->
        <div class="mb-4">
          <p class="text-body-2 font-weight-medium mb-2" style="color:#1A1A2E">How would you rate your experience?</p>
          <div class="d-flex gap-1" style="gap:8px">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              style="background:none; border:none; cursor:pointer; font-size:2rem; transition: transform 0.15s"
              :style="{ transform: star <= hoverStar ? 'scale(1.2)' : 'scale(1)' }"
              @mouseover="hoverStar = star"
              @mouseleave="hoverStar = selectedRating"
              @click="selectedRating = star; hoverStar = star"
            >
              {{ star <= hoverStar ? '⭐' : '☆' }}
            </button>
          </div>
        </div>

        <!-- Message -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium d-block mb-2" style="color:#1A1A2E">
            Tell us what happened <span style="color:#FF6584">*</span>
          </label>
          <textarea
            v-model="form.message"
            rows="4"
            placeholder="Please share what we could do better. Your feedback helps us improve!"
            required
            style="width:100%; border:2px solid #e0e0f0; border-radius:12px; padding:14px; font-size:0.95rem; font-family:inherit; resize:vertical; outline:none; transition: border-color 0.2s"
            :style="{ borderColor: form.message ? '#6C63FF' : '#e0e0f0' }"
          />
        </div>

        <!-- Category -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium d-block mb-2" style="color:#1A1A2E">Category (optional)</label>
          <div class="d-flex flex-wrap gap-2" style="gap:8px">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              style="border-radius:50px; padding:6px 14px; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s; border:2px solid"
              :style="{
                background: form.category === cat ? '#6C63FF' : 'transparent',
                color: form.category === cat ? 'white' : '#6C63FF',
                borderColor: '#6C63FF'
              }"
              @click="form.category = form.category === cat ? '' : cat"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Contact email (optional) -->
        <div class="mb-5">
          <label class="text-body-2 font-weight-medium d-block mb-2" style="color:#1A1A2E">
            Your email <span class="text-medium-emphasis" style="font-weight:400">(optional — so we can follow up)</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            style="width:100%; border:2px solid #e0e0f0; border-radius:12px; padding:12px 14px; font-size:0.95rem; font-family:inherit; outline:none; transition:border-color 0.2s"
            :style="{ borderColor: form.email ? '#6C63FF' : '#e0e0f0' }"
          />
        </div>

        <button
          type="submit"
          :disabled="!form.message || submitting"
          style="width:100%; background:linear-gradient(135deg,#6C63FF,#a18cd1); color:white; border:none; border-radius:14px; padding:16px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.2s; opacity:1"
          :style="{ opacity: !form.message || submitting ? 0.5 : 1, cursor: !form.message ? 'not-allowed' : 'pointer' }"
        >
          {{ submitting ? 'Submitting...' : 'Submit Feedback 📨' }}
        </button>
      </v-form>

      <p class="text-caption text-center text-medium-emphasis mt-4" style="opacity:0.6">
        Your feedback is private and will never be shared publicly.
        <br>Powered by ReviewFunnel
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeedbackStore } from '@/stores/feedback'

const route = useRoute()
const router = useRouter()
const feedbackStore = useFeedbackStore()

const sentiment = route.query.sentiment || 'okay'
const code = route.params.code

const hoverStar = ref(sentiment === 'okay' ? 3 : 1)
const selectedRating = ref(sentiment === 'okay' ? 3 : 1)
const submitting = ref(false)

const form = ref({ message: '', category: '', email: '' })

const categories = ['Service', 'Food/Product', 'Cleanliness', 'Wait time', 'Staff', 'Pricing', 'Atmosphere', 'Other']

const sentimentEmoji = computed(() => sentiment === 'okay' ? '😐' : '🙁')
const sentimentHeadline = computed(() =>
  sentiment === 'okay'
    ? "We want to do better for you"
    : "We're sorry about your experience"
)
const sentimentSubtext = computed(() =>
  sentiment === 'okay'
    ? "Tell us what we could improve. Your honest feedback helps us serve you better."
    : "We sincerely apologize. Please let us know what happened so we can make it right."
)

async function submitFeedback() {
  if (!form.value.message) return
  submitting.value = true

  await new Promise(r => setTimeout(r, 1000))

  // In production: POST /api/feedback { code, sentiment, message, rating, category, email }
  feedbackStore.addFeedback({
    qrCodeId: 'qr_' + code,
    qrCodeName: 'QR Code',
    locationName: 'Location',
    sentiment,
    message: form.value.message,
    rating: selectedRating.value,
    category: form.value.category,
    contactEmail: form.value.email,
  })

  submitting.value = false
  router.push({ name: 'ThankYou', params: { code }, query: { type: 'feedback' } })
}
</script>
