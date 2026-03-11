<template>
  <div style="position:relative; height:100%">
    <Bar :data="chartConfig" :options="options" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  data: { type: Object, required: true }
})

const chartConfig = computed(() => ({
  labels: props.data.labels,
  datasets: [
    {
      label: 'Scans',
      data: props.data.scans,
      backgroundColor: 'rgba(108,99,255,0.7)',
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      label: 'Review Clicks',
      data: props.data.reviews,
      backgroundColor: 'rgba(76,175,80,0.7)',
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      label: 'Feedback',
      data: props.data.feedback,
      backgroundColor: 'rgba(255,101,132,0.7)',
      borderRadius: 6,
      borderSkipped: false,
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1A1A2E',
      padding: 12,
      cornerRadius: 10,
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 12, font: { size: 10 }, color: '#aaa' },
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
