<template>
  <div style="max-width: 860px; margin: 0 auto">
    <!-- Header -->
    <div class="d-flex align-center gap-3 mb-6">
      <v-btn icon variant="text" to="/dashboard/qr-codes">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div>
        <h1 class="text-h5 font-weight-bold" style="color:#1A1A2E">Create Review Funnel QR Code</h1>
        <p class="text-body-2 text-medium-emphasis">Ready in under 30 seconds</p>
      </div>
    </div>

    <!-- Steps progress -->
    <v-stepper v-model="step" flat rounded="xl" style="background:transparent; box-shadow:none" class="mb-6">
      <v-stepper-header style="background:white; border-radius:16px; box-shadow: 0 2px 12px rgba(108,99,255,0.08); overflow:hidden">
        <v-stepper-item :value="1" title="Business Info" :complete="step > 1" color="primary" />
        <v-divider />
        <v-stepper-item :value="2" title="Review Link" :complete="step > 2" color="primary" />
        <v-divider />
        <v-stepper-item :value="3" title="Customize" :complete="step > 3" color="primary" />
        <v-divider />
        <v-stepper-item :value="4" title="Download" color="primary" />
      </v-stepper-header>
    </v-stepper>

    <v-row>
      <!-- Left: Form -->
      <v-col cols="12" lg="6">
        <!-- Step 1: Business info -->
        <v-card v-if="step === 1" rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-6">
            <h3 class="font-weight-bold mb-1">📍 QR Code Details</h3>
            <p class="text-body-2 text-medium-emphasis mb-5">Help customers know where this QR is placed</p>

            <v-text-field
              v-model="form.name"
              label="QR Code Name"
              placeholder="e.g. Main Entrance, Table #4, Receipt"
              prepend-inner-icon="mdi-tag-outline"
              hint="Helps you identify this QR in your dashboard"
              persistent-hint
              :rules="[rules.required]"
              class="mb-3"
            />

            <v-select
              v-model="form.locationId"
              :items="locationOptions"
              item-title="name"
              item-value="id"
              label="Location"
              prepend-inner-icon="mdi-map-marker-outline"
              hint="Which business location is this for?"
              persistent-hint
              class="mb-3"
            />

            <v-select
              v-model="form.placement"
              :items="placementOptions"
              label="Placement Type"
              prepend-inner-icon="mdi-format-list-bulleted-type"
              hint="Where will this QR be displayed?"
              persistent-hint
            />

            <v-btn
              color="primary"
              size="large"
              block
              class="mt-6"
              :disabled="!form.name"
              @click="step = 2"
            >
              Continue <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Step 2: Google Review Link -->
        <v-card v-if="step === 2" rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-6">
            <h3 class="font-weight-bold mb-1">⭐ Google Review Link</h3>
            <p class="text-body-2 text-medium-emphasis mb-5">Customers who rate "Great" will be sent here</p>

            <v-text-field
              v-model="form.googleReviewUrl"
              label="Google Review URL"
              placeholder="https://g.page/r/your-business/review"
              prepend-inner-icon="mdi-google"
              :rules="[rules.required, rules.url]"
              class="mb-3"
            />

            <v-alert type="info" variant="tonal" rounded="lg" class="mb-4">
              <template #title>How to find your Google Review link</template>
              <ol class="text-body-2 mt-1 ml-3">
                <li>Go to <strong>Google Maps</strong></li>
                <li>Search your business</li>
                <li>Click <strong>"Get more reviews"</strong></li>
                <li>Copy the link</li>
              </ol>
            </v-alert>

            <div class="d-flex gap-3 mt-2" style="gap:12px">
              <v-btn variant="tonal" @click="step = 1" style="flex:1">
                <v-icon start>mdi-arrow-left</v-icon> Back
              </v-btn>
              <v-btn color="primary" :disabled="!form.googleReviewUrl" @click="step = 3" style="flex:2">
                Continue <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Step 3: Customize -->
        <v-card v-if="step === 3" rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-6">
            <h3 class="font-weight-bold mb-1">🎨 Customize Landing Page</h3>
            <p class="text-body-2 text-medium-emphasis mb-5">What customers see when they scan the QR</p>

            <v-text-field
              v-model="form.pageTitle"
              label="Page Headline"
              placeholder="How was your experience?"
              prepend-inner-icon="mdi-format-title"
              class="mb-3"
            />

            <v-text-field
              v-model="form.businessDisplayName"
              label="Business Name on Page"
              placeholder="The Corner Café"
              prepend-inner-icon="mdi-storefront-outline"
              class="mb-3"
            />

            <div class="mb-4">
              <label class="text-body-2 font-weight-medium text-medium-emphasis d-block mb-2">Brand Color</label>
              <div class="d-flex gap-2" style="gap:8px; flex-wrap:wrap">
                <div
                  v-for="c in brandColors"
                  :key="c"
                  style="width:32px; height:32px; border-radius:50%; cursor:pointer; transition:transform 0.15s"
                  :style="{
                    background: c,
                    transform: form.brandColor === c ? 'scale(1.25)' : 'scale(1)',
                    boxShadow: form.brandColor === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none'
                  }"
                  @click="form.brandColor = c"
                />
              </div>
            </div>

            <v-switch
              v-model="form.collectFeedbackEmail"
              label="Ask for email in feedback form"
              color="primary"
              density="compact"
              hide-details
              class="mb-2"
            />
            <v-switch
              v-model="form.showBranding"
              label="Show 'Powered by ReviewFunnel'"
              color="primary"
              density="compact"
              hide-details
            />

            <div class="d-flex gap-3 mt-6" style="gap:12px">
              <v-btn variant="tonal" @click="step = 2" style="flex:1">
                <v-icon start>mdi-arrow-left</v-icon> Back
              </v-btn>
              <v-btn color="primary" @click="generateQR" :loading="generating" style="flex:2">
                <v-icon start>mdi-qrcode</v-icon> Generate QR Code
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Step 4: Download -->
        <v-card v-if="step === 4" rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-6">
            <div class="text-center mb-4">
              <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
              <h3 class="font-weight-bold text-success">QR Code Created! 🎉</h3>
              <p class="text-body-2 text-medium-emphasis mt-1">Your review funnel is live at:</p>
              <v-chip color="primary" variant="tonal" size="small" class="mt-1">
                reviewfunnel.io/r/{{ generatedCode }}
              </v-chip>
            </div>

            <v-divider class="my-4" />

            <h4 class="font-weight-bold mb-3">📥 Download Options</h4>

            <v-list density="compact" class="rounded-xl" style="background:#f8f9ff">
              <v-list-item
                v-for="dl in downloadOptions"
                :key="dl.label"
                :prepend-icon="dl.icon"
                :title="dl.label"
                :subtitle="dl.desc"
                rounded="lg"
                @click="triggerDownload(dl.type)"
                style="cursor:pointer"
                class="mb-1"
              >
                <template #append>
                  <v-btn size="x-small" color="primary" variant="tonal">
                    <v-icon size="14">mdi-download</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <v-btn
              color="primary"
              block
              class="mt-4"
              to="/dashboard/qr-codes"
              prepend-icon="mdi-view-grid-outline"
            >
              View All QR Codes
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right: Live Preview -->
      <v-col cols="12" lg="6">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff; position: sticky; top: 80px">
          <v-card-text class="pa-6">
            <h3 class="font-weight-bold mb-1">Live Preview</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">What customers see when they scan</p>

            <!-- Funnel Preview -->
            <div style="border-radius:20px; overflow:hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12)">
              <div :style="{ background: `linear-gradient(135deg, ${form.brandColor}, ${darken(form.brandColor)})` }" class="pa-8 text-center">
                <div style="background:white; border-radius:16px; padding:28px 20px">
                  <div class="font-weight-black text-body-1 mb-1" style="color:#1A1A2E">
                    {{ form.businessDisplayName || auth.user?.businessName || 'Your Business' }}
                  </div>
                  <div class="text-h6 font-weight-bold mb-5" style="color:#1A1A2E">
                    {{ form.pageTitle || 'How was your experience?' }}
                  </div>

                  <div
                    v-for="btn in previewButtons"
                    :key="btn.label"
                    style="border-radius:12px; padding:14px; margin-bottom:10px; cursor:pointer; font-weight:700; font-size:1rem; color:white"
                    :style="{ background: btn.color }"
                  >
                    {{ btn.emoji }} {{ btn.label }}
                  </div>

                  <div v-if="form.showBranding" class="text-caption text-medium-emphasis mt-3">
                    Powered by ReviewFunnel
                  </div>
                </div>
              </div>
            </div>

            <!-- QR Code Preview (simulated) -->
            <div v-if="step === 4" class="mt-4 text-center">
              <div style="background:#f8f9ff; border:2px dashed #6C63FF; border-radius:16px; padding:24px; display:inline-flex; flex-direction:column; align-items:center; gap:8px">
                <canvas ref="qrCanvas" style="border-radius:8px"></canvas>
                <div class="text-caption font-weight-medium" style="color:#6C63FF">
                  Scan me to test!
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQRStore } from '@/stores/qr'
import QRCode from 'qrcode'

const auth = useAuthStore()
const qrStore = useQRStore()
const router = useRouter()

const step = ref(1)
const generating = ref(false)
const generatedCode = ref('')
const qrCanvas = ref(null)

const form = ref({
  name: '',
  locationId: 'loc_001',
  placement: 'table',
  googleReviewUrl: '',
  pageTitle: 'How was your experience?',
  businessDisplayName: auth.user?.businessName || '',
  brandColor: '#6C63FF',
  collectFeedbackEmail: true,
  showBranding: true,
})

const brandColors = ['#6C63FF','#FF6584','#4CAF50','#FF9800','#2196F3','#E91E63','#009688','#1A1A2E']

const locationOptions = [
  { id: 'loc_001', name: 'Downtown Branch' },
  { id: 'loc_002', name: 'Westside Location' },
  { id: 'loc_new', name: '+ Add new location' },
]

const placementOptions = ['Table sticker', 'Counter QR', 'Receipt', 'Window', 'Menu', 'Business card', 'Other']

const downloadOptions = [
  { label: 'QR Code (PNG)', desc: 'High-resolution image', icon: 'mdi-image-outline', type: 'png' },
  { label: 'QR Code (SVG)', desc: 'Scalable for large prints', icon: 'mdi-vector-square', type: 'svg' },
  { label: 'Printable Poster (PDF)', desc: 'A4 table-ready poster', icon: 'mdi-file-pdf-box', type: 'poster' },
  { label: 'Table Tent (PDF)', desc: 'Folded table card', icon: 'mdi-table-furniture', type: 'tent' },
]

const previewButtons = [
  { emoji: '🙂', label: 'Great', color: 'linear-gradient(135deg, #56ab2f, #a8e063)' },
  { emoji: '😐', label: 'Okay', color: 'linear-gradient(135deg, #f093fb, #f5a623)' },
  { emoji: '🙁', label: 'Bad', color: 'linear-gradient(135deg, #ff6b6b, #ee0979)' },
]

const rules = {
  required: v => !!v || 'Required',
  url: v => /^https?:\/\/.+/.test(v) || 'Enter a valid URL starting with https://'
}

function darken(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - 50)
  const g = Math.max(0, ((n >> 8) & 0xff) - 50)
  const b = Math.max(0, (n & 0xff) - 50)
  return `#${[r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')}`
}

async function generateQR() {
  generating.value = true
  await new Promise(r => setTimeout(r, 1200))

  const code = Math.random().toString(36).substring(2, 8)
  generatedCode.value = code

  qrStore.addQRCode({
    name: form.value.name,
    locationId: form.value.locationId,
    locationName: locationOptions.find(l => l.id === form.value.locationId)?.name || 'Default',
    googleReviewUrl: form.value.googleReviewUrl,
    shortCode: code,
    status: 'active',
    config: { ...form.value }
  })

  generating.value = false
  step.value = 4
}

watch([step, qrCanvas], async () => {
  if (step.value === 4 && qrCanvas.value) {
    try {
      await QRCode.toCanvas(qrCanvas.value, `https://reviewfunnel.io/r/${generatedCode.value}`, {
        width: 180,
        color: { dark: '#1A1A2E', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      })
    } catch {}
  }
})

function triggerDownload(type) {
  if (type === 'png' && qrCanvas.value) {
    const link = document.createElement('a')
    link.download = `reviewfunnel-${generatedCode.value}.png`
    link.href = qrCanvas.value.toDataURL()
    link.click()
  } else {
    alert(`Downloading ${type.toUpperCase()} — In production, this calls the QR generation API.`)
  }
}
</script>
