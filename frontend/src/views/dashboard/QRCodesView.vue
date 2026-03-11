<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold" style="color:#1A1A2E">QR Codes</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">{{ qrStore.qrCodes.length }} active review funnels</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/dashboard/qr-codes/new" style="font-weight:700">
        Create QR Code
      </v-btn>
    </div>

    <!-- Empty state -->
    <div v-if="!qrStore.qrCodes.length" class="text-center py-16">
      <v-icon size="80" color="primary" style="opacity:0.2" class="mb-4">mdi-qrcode</v-icon>
      <h3 class="text-h6 font-weight-bold mb-2">No QR codes yet</h3>
      <p class="text-medium-emphasis mb-6">Create your first review funnel QR code in under 30 seconds</p>
      <v-btn color="primary" size="large" prepend-icon="mdi-plus" to="/dashboard/qr-codes/new">
        Create First QR Code
      </v-btn>
    </div>

    <!-- QR Code Grid -->
    <v-row v-else>
      <v-col v-for="qr in qrStore.qrCodes" :key="qr.id" cols="12" md="6" lg="4">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff; transition: all 0.2s" class="qr-card">
          <v-card-text class="pa-5">
            <!-- Header -->
            <div class="d-flex align-start justify-space-between mb-4">
              <div class="d-flex align-center gap-3">
                <div style="background: linear-gradient(135deg,#6C63FF,#a18cd1); border-radius:12px; padding:10px; line-height:1">
                  <v-icon color="white" size="22">mdi-qrcode</v-icon>
                </div>
                <div>
                  <div class="font-weight-bold" style="color:#1A1A2E">{{ qr.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    <v-icon size="12">mdi-map-marker</v-icon>
                    {{ qr.locationName }}
                  </div>
                </div>
              </div>
              <v-chip :color="qr.status === 'active' ? 'success' : 'grey'" size="x-small" variant="tonal">
                <v-icon start size="10">mdi-circle</v-icon>
                {{ qr.status }}
              </v-chip>
            </div>

            <!-- Stats row -->
            <div class="d-flex gap-2 mb-4" style="gap:8px">
              <div style="background:#f8f9ff; border-radius:10px; padding:10px 14px; flex:1; text-align:center">
                <div class="font-weight-black text-h6" style="color:#6C63FF">{{ qr.scans }}</div>
                <div class="text-caption text-medium-emphasis">Scans</div>
              </div>
              <div style="background:#f8f9ff; border-radius:10px; padding:10px 14px; flex:1; text-align:center">
                <div class="font-weight-black text-h6 text-success">{{ qr.reviewClicks }}</div>
                <div class="text-caption text-medium-emphasis">Reviews</div>
              </div>
              <div style="background:#f8f9ff; border-radius:10px; padding:10px 14px; flex:1; text-align:center">
                <div class="font-weight-black text-h6 text-warning">{{ calcRate(qr) }}%</div>
                <div class="text-caption text-medium-emphasis">Rate</div>
              </div>
            </div>

            <!-- Short link -->
            <div style="background:#6C63FF10; border-radius:8px; padding:8px 12px" class="d-flex align-center gap-2 mb-4">
              <v-icon size="14" color="primary">mdi-link</v-icon>
              <span class="text-caption font-weight-medium" style="color:#6C63FF; flex:1">
                reviewfunnel.io/r/{{ qr.shortCode }}
              </span>
              <v-btn
                icon size="x-small"
                variant="text"
                color="primary"
                @click="copyLink(qr.shortCode)"
              >
                <v-icon size="14">mdi-content-copy</v-icon>
              </v-btn>
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2" style="gap:8px">
              <v-btn
                variant="tonal"
                color="primary"
                size="small"
                prepend-icon="mdi-download"
                flex="1"
                style="flex:1"
                @click="openDownload(qr)"
              >
                Download
              </v-btn>
              <v-btn
                variant="tonal"
                color="error"
                size="small"
                icon
                @click="confirmDelete(qr)"
              >
                <v-icon size="16">mdi-delete-outline</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Download/Poster Dialog -->
    <v-dialog v-model="downloadDialog" max-width="520">
      <v-card rounded="xl" v-if="selectedQR">
        <v-card-text class="pa-6">
          <h3 class="font-weight-bold mb-1">Download QR Code</h3>
          <p class="text-body-2 text-medium-emphasis mb-5">Choose a format for "{{ selectedQR.name }}"</p>
          <v-row dense>
            <v-col cols="4" v-for="fmt in downloadFormats" :key="fmt.label">
              <div
                class="text-center pa-4 rounded-xl"
                style="border: 2px solid #f0f0ff; cursor:pointer; transition: all 0.2s"
                :style="selectedFormat === fmt.value ? { borderColor: '#6C63FF', background: '#6C63FF10' } : {}"
                @click="selectedFormat = fmt.value"
              >
                <v-icon :color="selectedFormat === fmt.value ? 'primary' : 'grey'" size="28" class="mb-2">{{ fmt.icon }}</v-icon>
                <div class="font-weight-bold text-body-2">{{ fmt.label }}</div>
                <div class="text-caption text-medium-emphasis">{{ fmt.desc }}</div>
              </div>
            </v-col>
          </v-row>
          <div class="d-flex gap-3 mt-5" style="gap:12px">
            <v-btn variant="tonal" @click="downloadDialog=false" style="flex:1">Cancel</v-btn>
            <v-btn color="primary" style="flex:2" prepend-icon="mdi-download" @click="downloadQR">
              Download {{ selectedFormat.toUpperCase() }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card rounded="xl" v-if="qrToDelete">
        <v-card-text class="pa-6 text-center">
          <v-icon size="48" color="error" class="mb-3">mdi-delete-circle-outline</v-icon>
          <h3 class="font-weight-bold mb-2">Delete "{{ qrToDelete.name }}"?</h3>
          <p class="text-body-2 text-medium-emphasis mb-5">This will permanently delete this QR code and all its analytics. This cannot be undone.</p>
          <div class="d-flex gap-3" style="gap:12px">
            <v-btn variant="tonal" @click="deleteDialog=false" style="flex:1">Cancel</v-btn>
            <v-btn color="error" style="flex:1" @click="doDelete">Delete</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Copy snackbar -->
    <v-snackbar v-model="snackbar" :timeout="2000" color="success" rounded="lg">
      <v-icon start>mdi-check-circle</v-icon>
      Link copied to clipboard!
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQRStore } from '@/stores/qr'

const qrStore = useQRStore()
const snackbar = ref(false)
const downloadDialog = ref(false)
const deleteDialog = ref(false)
const selectedQR = ref(null)
const qrToDelete = ref(null)
const selectedFormat = ref('png')

const downloadFormats = [
  { label: 'PNG', value: 'png', icon: 'mdi-image-outline', desc: 'For digital use' },
  { label: 'SVG', value: 'svg', icon: 'mdi-vector-square', desc: 'Scalable print' },
  { label: 'Poster', value: 'poster', icon: 'mdi-image-frame', desc: 'Print ready' },
]

function calcRate(qr) {
  return qr.scans ? Math.round((qr.reviewClicks / qr.scans) * 100) : 0
}

function copyLink(code) {
  navigator.clipboard.writeText(`https://reviewfunnel.io/r/${code}`)
  snackbar.value = true
}

function openDownload(qr) {
  selectedQR.value = qr
  downloadDialog.value = true
}

function downloadQR() {
  // In production: call QR generation service
  alert(`Downloading ${selectedFormat.value.toUpperCase()} for "${selectedQR.value.name}".\n\nIn production, this calls the QR generation API.`)
  downloadDialog.value = false
}

function confirmDelete(qr) {
  qrToDelete.value = qr
  deleteDialog.value = true
}

function doDelete() {
  qrStore.deleteQRCode(qrToDelete.value.id)
  deleteDialog.value = false
}
</script>

<style scoped>
.qr-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(108, 99, 255, 0.12) !important;
}
</style>
