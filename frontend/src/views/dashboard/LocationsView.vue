<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold" style="color:#1A1A2E">Locations</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Manage all your business locations</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="addDialog=true" style="font-weight:700">
        Add Location
      </v-btn>
    </div>

    <v-row>
      <v-col v-for="loc in locations" :key="loc.id" cols="12" md="6">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-5">
            <div class="d-flex align-start gap-4 mb-4" style="gap:16px">
              <div style="background:linear-gradient(135deg,#6C63FF,#a18cd1); border-radius:14px; padding:12px; line-height:1">
                <v-icon color="white" size="24">mdi-map-marker</v-icon>
              </div>
              <div style="flex:1">
                <div class="font-weight-bold text-body-1" style="color:#1A1A2E">{{ loc.name }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ loc.address }}</div>
                <div class="text-caption text-medium-emphasis">{{ loc.city }}, {{ loc.country }}</div>
              </div>
              <v-chip :color="loc.active ? 'success' : 'grey'" size="x-small" variant="tonal">
                {{ loc.active ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>

            <v-row dense class="mb-4">
              <v-col cols="4" v-for="s in locStats(loc)" :key="s.label">
                <div style="background:#f8f9ff; border-radius:10px; padding:10px; text-align:center">
                  <div class="font-weight-black text-body-1" :style="{ color: s.color }">{{ s.value }}</div>
                  <div class="text-caption text-medium-emphasis">{{ s.label }}</div>
                </div>
              </v-col>
            </v-row>

            <div class="d-flex gap-2" style="gap:8px">
              <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-qrcode" style="flex:1" to="/dashboard/qr-codes/new">
                Add QR
              </v-btn>
              <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-chart-line" style="flex:1" to="/dashboard/analytics">
                Analytics
              </v-btn>
              <v-btn size="small" variant="tonal" color="medium-emphasis" icon @click="editLoc(loc)">
                <v-icon size="16">mdi-pencil-outline</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Add location card -->
      <v-col cols="12" md="6">
        <v-card
          rounded="xl"
          elevation="0"
          style="border: 2px dashed #6C63FF30; cursor:pointer; transition: all 0.2s; min-height:200px; display:flex; align-items:center; justify-content:center"
          @click="addDialog=true"
          :hover="true"
        >
          <div class="text-center pa-6">
            <v-icon size="40" color="primary" style="opacity:0.4" class="mb-2">mdi-plus-circle-outline</v-icon>
            <div class="text-body-2 font-weight-medium" style="color:#6C63FF; opacity:0.7">Add New Location</div>
            <div class="text-caption text-medium-emphasis">Each location gets its own QR codes & analytics</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Location Dialog -->
    <v-dialog v-model="addDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <h3 class="font-weight-bold mb-4">{{ editMode ? 'Edit' : 'Add' }} Location</h3>
          <v-text-field v-model="locForm.name" label="Location Name" placeholder="Downtown Branch" prepend-inner-icon="mdi-storefront-outline" class="mb-3" />
          <v-text-field v-model="locForm.address" label="Street Address" prepend-inner-icon="mdi-map-marker-outline" class="mb-3" />
          <v-row dense>
            <v-col cols="6">
              <v-text-field v-model="locForm.city" label="City" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="locForm.country" label="Country" />
            </v-col>
          </v-row>
          <div class="d-flex gap-3 mt-3" style="gap:12px">
            <v-btn variant="tonal" @click="addDialog=false" style="flex:1">Cancel</v-btn>
            <v-btn color="primary" style="flex:2" @click="saveLocation">
              {{ editMode ? 'Save Changes' : 'Add Location' }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQRStore } from '@/stores/qr'

const qrStore = useQRStore()
const addDialog = ref(false)
const editMode = ref(false)

const locForm = ref({ name: '', address: '', city: '', country: '' })

const locations = ref([
  { id: 'loc_001', name: 'Downtown Branch', address: '123 Main Street', city: 'New York', country: 'USA', active: true },
  { id: 'loc_002', name: 'Westside Location', address: '456 West Ave', city: 'New York', country: 'USA', active: true },
])

function locStats(loc) {
  const qrs = qrStore.qrCodes.filter(q => q.locationId === loc.id)
  const scans = qrs.reduce((s, q) => s + q.scans, 0)
  const reviews = qrs.reduce((s, q) => s + q.reviewClicks, 0)
  return [
    { label: 'QR Codes', value: qrs.length, color: '#6C63FF' },
    { label: 'Scans', value: scans, color: '#1A1A2E' },
    { label: 'Reviews', value: reviews, color: '#4CAF50' },
  ]
}

function editLoc(loc) {
  locForm.value = { ...loc }
  editMode.value = true
  addDialog.value = true
}

function saveLocation() {
  if (editMode.value) {
    const idx = locations.value.findIndex(l => l.id === locForm.value.id)
    if (idx !== -1) locations.value[idx] = { ...locForm.value }
  } else {
    locations.value.push({ ...locForm.value, id: 'loc_' + Date.now(), active: true })
  }
  addDialog.value = false
  editMode.value = false
  locForm.value = { name: '', address: '', city: '', country: '' }
}
</script>
