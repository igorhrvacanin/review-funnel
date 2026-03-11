<template>
  <div class="fill-height" style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%); min-height: 100vh; display:flex; align-items:center; justify-content:center">
    <v-container style="max-width:460px">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div style="display:inline-flex; align-items:center; gap:12px; background:rgba(255,255,255,0.08); border-radius:16px; padding:16px 28px;">
          <div style="background: linear-gradient(135deg,#6C63FF,#a18cd1); border-radius:10px; padding:10px">
            <v-icon color="white" size="28">mdi-qrcode-scan</v-icon>
          </div>
          <div class="text-left">
            <div style="color:#fff; font-weight:800; font-size:1.3rem">ReviewFunnel</div>
            <div style="color:#6C63FF; font-size:0.72rem; font-weight:600; letter-spacing:0.1em">QR REVIEW SYSTEM</div>
          </div>
        </div>
      </div>

      <!-- Card -->
      <v-card rounded="xl" elevation="0" style="background:rgba(255,255,255,0.97); overflow:visible">
        <v-card-text class="pa-8">
          <h2 class="text-h5 font-weight-bold mb-1" style="color:#1A1A2E">Welcome back 👋</h2>
          <p class="text-body-2 text-medium-emphasis mb-6">Sign in to manage your review funnels</p>

          <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4" closable @click:close="error=''">
            {{ error }}
          </v-alert>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="form.email"
              label="Email address"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              :rules="[rules.required, rules.email]"
              class="mb-3"
              autofocus
            />
            <v-text-field
              v-model="form.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :rules="[rules.required]"
              class="mb-2"
            />
            <div class="text-right mb-4">
              <a href="#" class="text-primary text-decoration-none text-body-2 font-weight-medium">Forgot password?</a>
            </div>
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="loading"
              style="height:52px; font-size:1rem; font-weight:700"
            >
              Sign In
            </v-btn>
          </v-form>

          <v-divider class="my-6" />

          <div class="text-center text-body-2">
            Don't have an account?
            <router-link to="/register" class="text-primary font-weight-bold text-decoration-none ml-1">
              Start free trial
            </router-link>
          </div>
        </v-card-text>
      </v-card>

      <div class="text-center mt-6">
        <router-link to="/pricing" class="text-decoration-none" style="color:rgba(255,255,255,0.5); font-size:0.85rem">
          View pricing plans →
        </router-link>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = ref({ email: 'demo@reviewfunnel.io', password: 'demo1234' })

const rules = {
  required: v => !!v || 'This field is required',
  email: v => /.+@.+\..+/.test(v) || 'Enter a valid email'
}

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await new Promise(r => setTimeout(r, 800))
    // Mock auth — in production this calls POST /api/auth/login
    if (form.value.email && form.value.password) {
      auth.login({
        id: 'user_001',
        name: 'Alex Johnson',
        email: form.value.email,
        businessName: 'The Corner Café',
        plan: 'pro',
        logoUrl: null,
      }, 'mock_token_xyz')
      router.push(route.query.redirect || '/dashboard')
    } else {
      error.value = 'Invalid email or password.'
    }
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
