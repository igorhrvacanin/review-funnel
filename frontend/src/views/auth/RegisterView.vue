<template>
  <div class="fill-height" style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%); min-height: 100vh; display:flex; align-items:center; justify-content:center">
    <v-container style="max-width:500px">
      <div class="text-center mb-8">
        <div style="display:inline-flex; align-items:center; gap:12px; background:rgba(255,255,255,0.08); border-radius:16px; padding:16px 28px;">
          <div style="background: linear-gradient(135deg,#6C63FF,#a18cd1); border-radius:10px; padding:10px">
            <v-icon color="white" size="28">mdi-qrcode-scan</v-icon>
          </div>
          <div class="text-left">
            <div style="color:#fff; font-weight:800; font-size:1.3rem">ReviewFunnel</div>
            <div style="color:#6C63FF; font-size:0.72rem; font-weight:600; letter-spacing:0.1em">START FREE TODAY</div>
          </div>
        </div>
      </div>

      <v-card rounded="xl" elevation="0" style="background:rgba(255,255,255,0.97)">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-1" style="color:#1A1A2E">Create your account 🚀</h2>
          <p class="text-body-2 text-medium-emphasis mb-6">Start getting more 5-star reviews today — free forever</p>

          <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4">{{ error }}</v-alert>

          <v-form @submit.prevent="handleRegister">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.firstName" label="First name" :rules="[rules.required]" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.lastName" label="Last name" :rules="[rules.required]" prepend-inner-icon="mdi-account-outline" />
              </v-col>
            </v-row>
            <v-text-field
              v-model="form.businessName"
              label="Business name"
              prepend-inner-icon="mdi-storefront-outline"
              :rules="[rules.required]"
              class="mt-2"
              hint="This will appear on your review landing page"
              persistent-hint
            />
            <v-text-field
              v-model="form.email"
              label="Work email"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              :rules="[rules.required, rules.email]"
              class="mt-3"
            />
            <v-text-field
              v-model="form.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :rules="[rules.required, rules.minLength]"
              class="mt-3"
              hint="Minimum 8 characters"
              persistent-hint
            />

            <v-checkbox
              v-model="form.agreeTerms"
              :rules="[v => !!v || 'You must agree to continue']"
              class="mt-2"
              density="compact"
            >
              <template #label>
                <span class="text-body-2">
                  I agree to the
                  <a href="#" class="text-primary text-decoration-none font-weight-medium">Terms of Service</a>
                  and
                  <a href="#" class="text-primary text-decoration-none font-weight-medium">Privacy Policy</a>
                </span>
              </template>
            </v-checkbox>

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="loading"
              class="mt-4"
              style="height:52px; font-size:1rem; font-weight:700"
            >
              Create Free Account
            </v-btn>
          </v-form>

          <!-- Trust signals -->
          <div class="d-flex justify-center gap-4 mt-5" style="gap:24px">
            <div class="text-center text-body-2 text-medium-emphasis">
              <v-icon size="18" color="success" class="mr-1">mdi-check-circle</v-icon>No credit card
            </div>
            <div class="text-center text-body-2 text-medium-emphasis">
              <v-icon size="18" color="success" class="mr-1">mdi-check-circle</v-icon>1 free QR code
            </div>
            <div class="text-center text-body-2 text-medium-emphasis">
              <v-icon size="18" color="success" class="mr-1">mdi-check-circle</v-icon>Basic analytics
            </div>
          </div>

          <v-divider class="my-5" />
          <div class="text-center text-body-2">
            Already have an account?
            <router-link to="/login" class="text-primary font-weight-bold text-decoration-none ml-1">Sign in</router-link>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = ref({
  firstName: '', lastName: '', businessName: '', email: '', password: '', agreeTerms: false
})

const rules = {
  required: v => !!v || 'Required',
  email: v => /.+@.+\..+/.test(v) || 'Invalid email',
  minLength: v => v.length >= 8 || 'Minimum 8 characters'
}

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    await new Promise(r => setTimeout(r, 1000))
    auth.login({
      id: 'user_new',
      name: `${form.value.firstName} ${form.value.lastName}`,
      email: form.value.email,
      businessName: form.value.businessName,
      plan: 'free',
      logoUrl: null,
    }, 'mock_token_new')
    router.push('/dashboard')
  } catch {
    error.value = 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
