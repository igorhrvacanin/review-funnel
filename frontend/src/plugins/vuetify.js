import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const reviewFunnelTheme = {
  dark: false,
  colors: {
    primary: '#6C63FF',
    secondary: '#03DAC6',
    accent: '#FF6584',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    background: '#F8F9FF',
    surface: '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#000000',
    'sidebar-bg': '#1A1A2E',
    'sidebar-text': '#E0E0FF',
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'reviewFunnelTheme',
    themes: { reviewFunnelTheme }
  },
  defaults: {
    VBtn: { rounded: 'lg', elevation: 0 },
    VCard: { rounded: 'xl', elevation: 2 },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' }
  }
})
