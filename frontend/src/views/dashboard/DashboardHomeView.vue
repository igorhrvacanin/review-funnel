<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold" style="color:#1A1A2E">Good morning, {{ firstName }} ☀️</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Here's how your review funnels are performing today</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/dashboard/qr-codes/new" style="font-weight:700">
        New QR Code
      </v-btn>
    </div>

    <!-- KPI Stats -->
    <v-row class="mb-6">
      <v-col v-for="stat in kpiStats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card rounded="xl" elevation="0" style="background:white; border:1px solid #f0f0ff">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <div style="background: linear-gradient(135deg, var(--c1), var(--c2)); border-radius:12px; padding:10px; width:44px; height:44px; display:flex; align-items:center; justify-content:center"
                :style="{ '--c1': stat.color1, '--c2': stat.color2 }">
                <v-icon color="white" size="20">{{ stat.icon }}</v-icon>
              </div>
              <v-chip :color="stat.trend > 0 ? 'success' : 'error'" size="x-small" variant="tonal" label>
                <v-icon start size="12">{{ stat.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
                {{ Math.abs(stat.trend) }}% vs last month
              </v-chip>
            </div>
            <div class="text-h4 font-weight-black mb-1" style="color:#1A1A2E">{{ stat.value }}</div>
            <div class="text-body-2 text-medium-emphasis font-weight-medium">{{ stat.label }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Scan Activity Chart -->
      <v-col cols="12" lg="8">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <h3 class="font-weight-bold" style="color:#1A1A2E">Scan Activity</h3>
                <p class="text-body-2 text-medium-emphasis">Last 30 days</p>
              </div>
              <v-btn-toggle v-model="chartPeriod" density="compact" rounded="lg" variant="tonal" color="primary">
                <v-btn value="7d" size="small">7D</v-btn>
                <v-btn value="30d" size="small">30D</v-btn>
                <v-btn value="90d" size="small">90D</v-btn>
              </v-btn-toggle>
            </div>
            <MiniLineChart :data="chartData" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Conversion Funnel -->
      <v-col cols="12" lg="4">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff; height:100%">
          <v-card-text class="pa-5">
            <h3 class="font-weight-bold mb-1" style="color:#1A1A2E">Conversion Funnel</h3>
            <p class="text-body-2 text-medium-emphasis mb-5">This month</p>

            <div v-for="step in funnelSteps" :key="step.label" class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2 font-weight-medium">{{ step.label }}</span>
                <span class="font-weight-bold text-body-2" :style="{ color: step.color }">{{ step.value }}</span>
              </div>
              <v-progress-linear
                :model-value="step.pct"
                :color="step.color"
                rounded
                height="8"
                bg-color="#f0f0ff"
              />
            </div>

            <v-divider class="my-4" />
            <div class="text-center">
              <div class="text-h4 font-weight-black" style="background: linear-gradient(135deg,#6C63FF,#a18cd1); background-clip:text; -webkit-background-clip:text; -webkit-text-fill-color:transparent">
                {{ conversionRate }}%
              </div>
              <div class="text-body-2 text-medium-emphasis">Review Conversion Rate</div>
              <v-chip color="success" size="small" variant="tonal" class="mt-2">
                <v-icon start size="12">mdi-trophy</v-icon>
                Above industry avg (18%)
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent QR codes + feedback -->
    <v-row class="mt-2">
      <v-col cols="12" lg="7">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="font-weight-bold" style="color:#1A1A2E">Your QR Codes</h3>
              <v-btn variant="text" color="primary" size="small" to="/dashboard/qr-codes">View all</v-btn>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold text-medium-emphasis" style="font-size:0.75rem;text-transform:uppercase">Name</th>
                  <th class="text-right font-weight-bold text-medium-emphasis" style="font-size:0.75rem;text-transform:uppercase">Scans</th>
                  <th class="text-right font-weight-bold text-medium-emphasis" style="font-size:0.75rem;text-transform:uppercase">Reviews</th>
                  <th class="text-right font-weight-bold text-medium-emphasis" style="font-size:0.75rem;text-transform:uppercase">Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="qr in topQRCodes" :key="qr.id" style="cursor:pointer" @click="$router.push('/dashboard/qr-codes')">
                  <td>
                    <div class="d-flex align-center gap-2 py-2">
                      <div style="background:#6C63FF15; border-radius:8px; padding:6px; line-height:1">
                        <v-icon color="primary" size="16">mdi-qrcode</v-icon>
                      </div>
                      <div>
                        <div class="font-weight-medium text-body-2">{{ qr.name }}</div>
                        <div class="text-caption text-medium-emphasis">{{ qr.locationName }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-right font-weight-bold">{{ qr.scans }}</td>
                  <td class="text-right font-weight-bold text-success">{{ qr.reviewClicks }}</td>
                  <td class="text-right">
                    <v-chip :color="rateColor(qr)" size="x-small" variant="tonal">
                      {{ calcRate(qr) }}%
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Recent Feedback -->
      <v-col cols="12" lg="5">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff; height:100%">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="font-weight-bold" style="color:#1A1A2E">Recent Feedback</h3>
              <v-btn variant="text" color="primary" size="small" to="/dashboard/feedback">View all</v-btn>
            </div>
            <div v-for="fb in recentFeedback" :key="fb.id" class="mb-3">
              <div style="background:#f8f9ff; border-radius:12px; padding:12px 14px">
                <div class="d-flex align-center gap-2 mb-1">
                  <v-chip
                    :color="sentimentColor(fb.sentiment)"
                    size="x-small"
                    variant="tonal"
                    label
                  >
                    {{ sentimentIcon(fb.sentiment) }} {{ fb.sentiment.toUpperCase() }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis ml-auto">{{ timeAgo(fb.createdAt) }}</span>
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0" style="line-height:1.5">
                  "{{ fb.message.substring(0, 90) }}{{ fb.message.length > 90 ? '...' : '' }}"
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQRStore } from '@/stores/qr'
import { useFeedbackStore } from '@/stores/feedback'
import MiniLineChart from '@/components/MiniLineChart.vue'

const auth = useAuthStore()
const qrStore = useQRStore()
const feedbackStore = useFeedbackStore()

const chartPeriod = ref('30d')

const firstName = computed(() => (auth.user?.name || '').split(' ')[0] || 'there')

const totalScans = computed(() => qrStore.qrCodes.reduce((s, q) => s + q.scans, 0))
const totalReviews = computed(() => qrStore.qrCodes.reduce((s, q) => s + q.reviewClicks, 0))
const totalFeedback = computed(() => qrStore.qrCodes.reduce((s, q) => s + q.feedbackCount, 0))
const conversionRate = computed(() => totalScans.value ? Math.round((totalReviews.value / totalScans.value) * 100) : 0)

const kpiStats = computed(() => [
  { label: 'Total QR Scans', value: totalScans.value, icon: 'mdi-qrcode-scan', color1: '#6C63FF', color2: '#a18cd1', trend: 24 },
  { label: 'Google Review Clicks', value: totalReviews.value, icon: 'mdi-star', color1: '#f093fb', color2: '#f5a623', trend: 18 },
  { label: 'Conversion Rate', value: conversionRate.value + '%', icon: 'mdi-trending-up', color1: '#4CAF50', color2: '#8BC34A', trend: 7 },
  { label: 'Private Feedback', value: totalFeedback.value, icon: 'mdi-message-text', color1: '#FF6584', color2: '#FF8C71', trend: -3 },
])

const funnelSteps = computed(() => [
  { label: '📱 QR Scanned', value: totalScans.value, pct: 100, color: '#6C63FF' },
  { label: '😊 Selected "Great"', value: Math.round(totalScans.value * 0.62), pct: 62, color: '#4CAF50' },
  { label: '⭐ Clicked Review', value: totalReviews.value, pct: conversionRate.value, color: '#f5a623' },
  { label: '💬 Left Feedback', value: totalFeedback.value, pct: Math.round((totalFeedback.value / totalScans.value) * 100), color: '#FF6584' },
])

const topQRCodes = computed(() => qrStore.qrCodes.slice(0, 4))
const recentFeedback = computed(() => feedbackStore.feedbacks.slice(0, 3))

const chartData = computed(() => {
  const history = qrStore.scanHistory.slice(-30)
  return {
    labels: history.map(h => h.date.slice(5)),
    scans: history.map(h => h.scans),
    reviews: history.map(h => h.reviewClicks)
  }
})

function calcRate(qr) {
  return qr.scans ? Math.round((qr.reviewClicks / qr.scans) * 100) : 0
}
function rateColor(qr) {
  const r = calcRate(qr)
  return r >= 40 ? 'success' : r >= 25 ? 'warning' : 'error'
}
function sentimentColor(s) { return { great: 'success', okay: 'warning', bad: 'error' }[s] || 'grey' }
function sentimentIcon(s) { return { great: '🙂', okay: '😐', bad: '🙁' }[s] || '❓' }
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}
</script>
