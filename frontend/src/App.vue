<script setup>
import { useTheme } from 'vuetify'
const theme = useTheme()
</script>

<template>
  <v-app :theme="theme.global.name.value">
    <router-view />
  </v-app>
</template>
