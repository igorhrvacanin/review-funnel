import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('rf_user') || 'null'))
  const token = ref(localStorage.getItem('rf_token') || null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const plan = computed(() => user.value?.plan || 'free')
  const isPro = computed(() => ['pro', 'business'].includes(plan.value))
  const isBusiness = computed(() => plan.value === 'business')

  function login(userData, authToken) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('rf_user', JSON.stringify(userData))
    localStorage.setItem('rf_token', authToken)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('rf_user')
    localStorage.removeItem('rf_token')
  }

  function updateUser(data) {
    user.value = { ...user.value, ...data }
    localStorage.setItem('rf_user', JSON.stringify(user.value))
  }

  return { user, token, isLoggedIn, plan, isPro, isBusiness, login, logout, updateUser }
})
