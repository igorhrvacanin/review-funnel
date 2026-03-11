<template>
  <div style="position:relative; height:200px">
    <Line :data="chartConfig" :options="options" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  data: { type: Object, required: true }
})

const chartConfig = computed(() => ({
  labels: props.data.labels,
  datasets: [
    {
      label: 'QR Scans',
      data: props.data.scans,
      borderColor: '#6C63FF',
      backgroundColor: 'rgba(108,99,255,0.08)',
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true
    },
    {
      label: 'Review Clicks',
      data: props.data.reviews,
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76,175,80,0.05)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 12, weight: '600' } }
    },
    tooltip: {
      backgroundColor: '#1A1A2E',
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 12 },
      bodyFont: { size: 13, weight: 'bold' }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 8, font: { size: 11 }, color: '#aaa' },
      border: { display: false }
    },
    y: {
      grid: { color: '#f0f0ff' },
      ticks: { font: { size: 11 }, color: '#aaa' },
      border: { display: false },
      beginAtZero: true
    }
  }
}
</script>
