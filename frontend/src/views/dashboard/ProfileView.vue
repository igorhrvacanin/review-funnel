<template>
  <div style="max-width:740px">
    <h1 class="text-h5 font-weight-bold mb-6" style="color:#1A1A2E">Business Profile</h1>

    <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff" class="mb-5">
      <v-card-text class="pa-6">
        <div class="d-flex align-center gap-5 mb-6" style="gap:20px">
          <!-- Logo upload -->
          <div style="position:relative">
            <div
              style="width:88px; height:88px; border-radius:20px; background:linear-gradient(135deg,#6C63FF,#a18cd1); display:flex; align-items:center; justify-content:center; cursor:pointer; overflow:hidden"
              @click="triggerLogoUpload"
            >
              <img v-if="profile.logoUrl" :src="profile.logoUrl" style="width:100%; height:100%; object-fit:cover" />
              <v-icon v-else color="white" size="36">mdi-storefront</v-icon>
            </div>
            <v-btn
              icon size="x-small"
              color="primary"
              style="position:absolute; bottom:-4px; right:-4px"
              @click="triggerLogoUpload"
            >
              <v-icon size="14">mdi-camera</v-icon>
            </v-btn>
            <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="handleLogoChange" />
          </div>
          <div>
            <h2 class="font-weight-bold text-h6" style="color:#1A1A2E">{{ profile.businessName }}</h2>
            <p class="text-body-2 text-medium-emphasis">{{ profile.email }}</p>
            <v-chip color="primary" size="small" variant="tonal" class="mt-1">
              <v-icon start size="12">mdi-crown</v-icon>
              {{ auth.plan.toUpperCase() }} Plan
            </v-chip>
          </div>
        </div>

        <h3 class="font-weight-bold mb-4" style="color:#1A1A2E">Business Information</h3>
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field v-model="profile.businessName" label="Business Name" prepend-inner-icon="mdi-storefront-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="profile.industry" label="Industry" prepend-inner-icon="mdi-tag-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="profile.phone" label="Phone Number" prepend-inner-icon="mdi-phone-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="profile.website" label="Website" prepend-inner-icon="mdi-web" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="profile.googleReviewUrl" label="Default Google Review URL" prepend-inner-icon="mdi-google" hint="Used as the default for all new QR codes" persistent-hint />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Funnel defaults -->
    <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff" class="mb-5">
      <v-card-text class="pa-6">
        <h3 class="font-weight-bold mb-4" style="color:#1A1A2E">🎨 Review Funnel Defaults</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">These settings apply to all new QR codes you create</p>

        <v-text-field
          v-model="profile.funnelTitle"
          label="Default Funnel Headline"
          placeholder="How was your experience?"
          class="mb-3"
        />

        <div class="mb-4">
          <label class="text-body-2 font-weight-medium text-medium-emphasis d-block mb-2">Default Brand Color</label>
          <div class="d-flex gap-2" style="gap:8px; flex-wrap:wrap">
            <div
              v-for="c in brandColors"
              :key="c"
              style="width:36px; height:36px; border-radius:50%; cursor:pointer; transition:transform 0.15s"
              :style="{
                background: c,
                transform: profile.brandColor === c ? 'scale(1.25)' : 'scale(1)',
                boxShadow: profile.brandColor === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none'
              }"
              @click="profile.brandColor = c"
            />
          </div>
        </div>

        <v-switch v-model="profile.showBranding" label="Show 'Powered by ReviewFunnel' on funnel pages" color="primary" density="compact" hide-details />
      </v-card-text>
    </v-card>

    <!-- Notifications -->
    <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff" class="mb-5">
      <v-card-text class="pa-6">
        <h3 class="font-weight-bold mb-4" style="color:#1A1A2E">🔔 Notifications</h3>
        <v-switch v-model="profile.notifyNewFeedback" label="Email me when new private feedback arrives" color="primary" density="compact" hide-details class="mb-2" />
        <v-switch v-model="profile.notifyWeeklyReport" label="Send weekly analytics digest" color="primary" density="compact" hide-details class="mb-2" />
        <v-switch v-model="profile.notifyMilestones" label="Notify me on scan milestones (100, 500, 1000...)" color="primary" density="compact" hide-details />
      </v-card-text>
    </v-card>

    <div class="d-flex gap-3" style="gap:12px">
      <v-btn color="primary" size="large" prepend-icon="mdi-content-save" @click="saveProfile" :loading="saving">
        Save Changes
      </v-btn>
      <v-btn variant="tonal" size="large">Reset</v-btn>
    </div>

    <v-snackbar v-model="snackbar" timeout="2500" color="success" rounded="lg">
      <v-icon start>mdi-check-circle</v-icon>
      Profile saved successfully!
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const saving = ref(false)
const snackbar = ref(false)
const logoInput = ref(null)

const brandColors = ['#6C63FF','#FF6584','#4CAF50','#FF9800','#2196F3','#E91E63','#009688','#1A1A2E']

const profile = ref({
  businessName: auth.user?.businessName || 'The Corner Café',
  email: auth.user?.email || '',
  phone: '+1 (555) 123-4567',
  website: 'https://thecornercafe.com',
  industry: 'Food & Beverage',
  googleReviewUrl: 'https://g.page/r/demo-business/review',
  logoUrl: auth.user?.logoUrl || null,
  funnelTitle: 'How was your experience?',
  brandColor: '#6C63FF',
  showBranding: true,
  notifyNewFeedback: true,
  notifyWeeklyReport: true,
  notifyMilestones: false,
})

function triggerLogoUpload() {
  logoInput.value?.click()
}

function handleLogoChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (evt) => { profile.value.logoUrl = evt.target.result }
    reader.readAsDataURL(file)
  }
}

async function saveProfile() {
  saving.value = true
  await new Promise(r => setTimeout(r, 800))
  auth.updateUser({ businessName: profile.value.businessName, logoUrl: profile.value.logoUrl })
  saving.value = false
  snackbar.value = true
}
</script>
