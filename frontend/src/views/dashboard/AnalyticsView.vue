<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold" style="color:#1A1A2E">Analytics</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Track your review funnel performance</p>
      </div>
      <div class="d-flex gap-2" style="gap:8px">
        <v-select
          v-model="selectedQR"
          :items="qrOptions"
          item-title="name"
          item-value="id"
          density="compact"
          hide-details
          style="width:200px"
          variant="outlined"
        />
        <v-btn-toggle v-model="period" density="compact" rounded="lg" variant="tonal" color="primary" mandatory>
          <v-btn value="7d" size="small">7D</v-btn>
          <v-btn value="30d" size="small">30D</v-btn>
          <v-btn value="90d" size="small">90D</v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <!-- KPI Row -->
    <v-row class="mb-6">
      <v-col v-for="kpi in kpis" :key="kpi.label" cols="6" lg="3">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff; overflow:hidden">
          <div style="height:4px" :style="{ background: kpi.accent }" />
          <v-card-text class="pa-5">
            <div class="text-h4 font-weight-black mb-1" :style="{ color: kpi.textColor }">{{ kpi.value }}</div>
            <div class="text-body-2 font-weight-medium text-medium-emphasis">{{ kpi.label }}</div>
            <div class="text-caption mt-1" :style="{ color: kpi.trend >= 0 ? '#4CAF50' : '#FF5252' }">
              <v-icon size="12">{{ kpi.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
              {{ Math.abs(kpi.trend) }}% vs last period
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main chart -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <h3 class="font-weight-bold" style="color:#1A1A2E">Scan & Review Activity</h3>
                <p class="text-body-2 text-medium-emphasis">Daily breakdown</p>
              </div>
              <div class="d-flex gap-4" style="gap:16px">
                <div class="d-flex align-center gap-1" style="gap:6px">
                  <div style="width:12px; height:12px; background:#6C63FF; border-radius:2px" />
                  <span class="text-caption font-weight-medium">Scans</span>
                </div>
                <div class="d-flex align-center gap-1" style="gap:6px">
                  <div style="width:12px; height:12px; background:#4CAF50; border-radius:2px" />
                  <span class="text-caption font-weight-medium">Review Clicks</span>
                </div>
                <div class="d-flex align-center gap-1" style="gap:6px">
                  <div style="width:12px; height:12px; background:#FF6584; border-radius:2px" />
                  <span class="text-caption font-weight-medium">Feedback</span>
                </div>
              </div>
            </div>
            <div style="height:280px; position:relative">
              <BarChart :data="barChartData" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Sentiment Breakdown -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff; height:100%">
          <v-card-text class="pa-5">
            <h3 class="font-weight-bold mb-1" style="color:#1A1A2E">Sentiment Breakdown</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">How customers rated their experience</p>

            <div v-for="s in sentimentData" :key="s.label" class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <div class="d-flex align-center gap-2">
                  <span style="font-size:1.2rem">{{ s.emoji }}</span>
                  <span class="text-body-2 font-weight-medium">{{ s.label }}</span>
                </div>
                <div class="d-flex align-center gap-3" style="gap:12px">
                  <span class="font-weight-bold" :style="{ color: s.color }">{{ s.count }}</span>
                  <v-chip :color="s.chipColor" size="x-small" variant="tonal">{{ s.pct }}%</v-chip>
                </div>
              </div>
              <v-progress-linear :model-value="s.pct" :color="s.color" rounded height="10" bg-color="#f0f0f8" />
            </div>

            <v-divider class="my-4" />
            <div class="d-flex gap-4 text-center" style="gap:16px">
              <div style="flex:1; background:#f8f9ff; border-radius:12px; padding:12px">
                <div class="font-weight-black text-h6 text-success">{{ positiveRate }}%</div>
                <div class="text-caption text-medium-emphasis">Happy customers</div>
              </div>
              <div style="flex:1; background:#f8f9ff; border-radius:12px; padding:12px">
                <div class="font-weight-black text-h6" style="color:#FF6584">{{ negativeRate }}%</div>
                <div class="text-caption text-medium-emphasis">Need attention</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Per-QR Performance Table -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-5">
            <h3 class="font-weight-bold mb-1" style="color:#1A1A2E">QR Code Performance</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">Ranked by conversion rate</p>

            <v-table>
              <thead>
                <tr>
                  <th class="text-left" style="color:#888; font-size:0.72rem; text-transform:uppercase">QR Code</th>
                  <th class="text-right" style="color:#888; font-size:0.72rem; text-transform:uppercase">Scans</th>
                  <th class="text-right" style="color:#888; font-size:0.72rem; text-transform:uppercase">Reviews</th>
                  <th class="text-right" style="color:#888; font-size:0.72rem; text-transform:uppercase">Feedback</th>
                  <th class="text-right" style="color:#888; font-size:0.72rem; text-transform:uppercase">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="qr in rankedQRCodes" :key="qr.id">
                  <td>
                    <div class="py-2">
                      <div class="font-weight-medium text-body-2">{{ qr.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ qr.locationName }}</div>
                    </div>
                  </td>
                  <td class="text-right font-weight-bold">{{ qr.scans }}</td>
                  <td class="text-right">
                    <span class="font-weight-bold text-success">{{ qr.reviewClicks }}</span>
                  </td>
                  <td class="text-right">
                    <span class="font-weight-bold" style="color:#FF6584">{{ qr.feedbackCount }}</span>
                  </td>
                  <td class="text-right">
                    <v-chip
                      :color="rateChipColor(qr)"
                      size="small"
                      variant="tonal"
                      style="font-weight:700"
                    >
                      {{ convRate(qr) }}%
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Peak Hours Heatmap -->
    <v-row class="mt-2">
      <v-col cols="12">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-5">
            <h3 class="font-weight-bold mb-1" style="color:#1A1A2E">Peak Scan Hours</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">Best times to engage customers</p>
            <div class="d-flex gap-1 flex-wrap" style="gap:6px">
              <div
                v-for="h in heatmapData"
                :key="h.hour"
                style="text-align:center; flex:1; min-width:32px"
              >
                <div
                  style="border-radius:8px; margin-bottom:4px; height:48px; transition:all 0.2s; cursor:default"
                  :style="{
                    background: `rgba(108,99,255,${h.intensity})`,
                    boxShadow: h.intensity > 0.6 ? '0 2px 8px rgba(108,99,255,0.3)' : 'none'
                  }"
                  :title="`${h.label}: ${h.scans} scans`"
                />
                <div class="text-caption" style="color:#aaa; font-size:0.65rem">{{ h.label }}</div>
              </div>
            </div>
            <div class="d-flex align-center justify-end gap-2 mt-3" style="gap:8px">
              <span class="text-caption text-medium-emphasis">Low</span>
              <div style="background:linear-gradient(to right, rgba(108,99,255,0.05), rgba(108,99,255,1)); width:80px; height:8px; border-radius:4px" />
              <span class="text-caption text-medium-emphasis">High</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQRStore } from '@/stores/qr'
import BarChart from '@/components/BarChart.vue'

const qrStore = useQRStore()
const period = ref('30d')
const selectedQR = ref('all')

const qrOptions = computed(() => [
  { id: 'all', name: 'All QR Codes' },
  ...qrStore.qrCodes.map(q => ({ id: q.id, name: q.name }))
])

const totalScans = computed(() => qrStore.qrCodes.reduce((s, q) => s + q.scans, 0))
const totalReviews = computed(() => qrStore.qrCodes.reduce((s, q) => s + q.reviewClicks, 0))
const totalFeedback = computed(() => qrStore.qrCodes.reduce((s, q) => s + q.feedbackCount, 0))
const conversionRate = computed(() => totalScans.value ? Math.round((totalReviews.value / totalScans.value) * 100) : 0)

const kpis = computed(() => [
  { label: 'Total QR Scans', value: totalScans.value, accent: 'linear-gradient(135deg,#6C63FF,#a18cd1)', textColor: '#6C63FF', trend: 24 },
  { label: 'Review Clicks', value: totalReviews.value, accent: 'linear-gradient(135deg,#4CAF50,#8BC34A)', textColor: '#4CAF50', trend: 18 },
  { label: 'Conversion Rate', value: conversionRate.value + '%', accent: 'linear-gradient(135deg,#f093fb,#f5a623)', textColor: '#f5a623', trend: 7 },
  { label: 'Private Feedback', value: totalFeedback.value, accent: 'linear-gradient(135deg,#FF6584,#FF8C71)', textColor: '#FF6584', trend: -3 },
])

const rankedQRCodes = computed(() =>
  [...qrStore.qrCodes].sort((a, b) => convRate(b) - convRate(a))
)

function convRate(qr) {
  return qr.scans ? Math.round((qr.reviewClicks / qr.scans) * 100) : 0
}

function rateChipColor(qr) {
  const r = convRate(qr)
  return r >= 40 ? 'success' : r >= 25 ? 'warning' : 'error'
}

const sentimentData = computed(() => {
  const great = Math.round(totalScans.value * 0.62)
  const okay = Math.round(totalScans.value * 0.24)
  const bad = totalScans.value - great - okay
  const total = totalScans.value || 1
  return [
    { label: 'Great', emoji: '🙂', count: great, pct: Math.round(great / total * 100), color: '#4CAF50', chipColor: 'success' },
    { label: 'Okay', emoji: '😐', count: okay, pct: Math.round(okay / total * 100), color: '#f5a623', chipColor: 'warning' },
    { label: 'Bad', emoji: '🙁', count: bad, pct: Math.round(bad / total * 100), color: '#FF5252', chipColor: 'error' },
  ]
})

const positiveRate = computed(() => Math.round((Math.round(totalScans.value * 0.62) / (totalScans.value || 1)) * 100))
const negativeRate = computed(() => 100 - positiveRate.value)

const barChartData = computed(() => {
  const days = period.value === '7d' ? 7 : period.value === '30d' ? 30 : 90
  const history = qrStore.scanHistory.slice(-days)
  return {
    labels: history.map(h => h.date.slice(5)),
    scans: history.map(h => h.scans),
    reviews: history.map(h => h.reviewClicks),
    feedback: history.map(h => h.feedback)
  }
})

const heatmapData = computed(() => {
  const hours = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p']
  const intensities = [0.02,0.01,0.01,0.01,0.02,0.04,0.08,0.15,0.28,0.45,0.55,0.62,0.72,0.65,0.58,0.52,0.48,0.55,0.68,0.75,0.70,0.58,0.42,0.22]
  return hours.map((h, i) => ({
    hour: i, label: h,
    intensity: intensities[i],
    scans: Math.round(intensities[i] * totalScans.value * 0.1)
  }))
})
</script>
