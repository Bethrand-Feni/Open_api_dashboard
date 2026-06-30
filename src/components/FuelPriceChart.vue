<script setup>
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js'
import { computed, onMounted, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { endpoints, request } from '../services/openFuelApi'

ChartJS.register(CategoryScale, Filler, LinearScale, LineElement, PointElement, Legend, Tooltip)

let cachedHistory = null
let historyRequest = null

const loading = ref(true)
const error = ref('')
const history = ref([])

function average(values) {
  const numericValues = values.filter((value) => typeof value === 'number' && Number.isFinite(value))
  if (!numericValues.length) return null
  const total = numericValues.reduce((sum, value) => sum + value, 0)
  return Number((total / numericValues.length).toFixed(2))
}

function monthLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' })
}

function fuelAverage(month, type) {
  return average(Object.values(month?.[type] || {}))
}

function reasonFor(type, index) {
  return history.value[index]?.news?.[type] || 'No monthly summary available yet.'
}

const chartData = computed(() => {
  return {
    labels: history.value.map((month) => monthLabel(month.month)),
    datasets: [
      {
        label: 'Petrol',
        data: history.value.map((month) => fuelAverage(month, 'petrol')),
        borderColor: '#fb923c',
        backgroundColor: 'rgba(249, 115, 22, 0.14)',
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#050505',
        pointHoverRadius: 7,
        pointRadius: 4,
        borderWidth: 2,
        tension: 0.42,
        fill: true
      },
      {
        label: 'Diesel',
        data: history.value.map((month) => fuelAverage(month, 'diesel')),
        borderColor: '#a1a1aa',
        backgroundColor: 'rgba(161, 161, 170, 0.08)',
        pointBackgroundColor: '#d4d4d8',
        pointBorderColor: '#050505',
        pointHoverRadius: 7,
        pointRadius: 4,
        borderWidth: 2,
        tension: 0.42,
        fill: true
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'nearest'
  },
  plugins: {
    legend: {
      labels: {
        color: '#d4d4d8',
        boxWidth: 12,
        boxHeight: 12,
        font: { family: 'Inter' }
      }
    },
    tooltip: {
      backgroundColor: '#101010',
      borderColor: '#272727',
      borderWidth: 1,
      titleColor: '#ffffff',
      bodyColor: '#e4e4e7',
      displayColors: false,
      padding: 12,
      callbacks: {
        label(context) {
          return `${context.dataset.label}: R${context.parsed.y?.toFixed(2)}`
        },
        afterLabel(context) {
          return reasonFor(context.dataset.label.toLowerCase(), context.dataIndex)
        }
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#a1a1aa' }
    },
    y: {
      beginAtZero: false,
      grid: { color: 'rgba(255,255,255,0.08)' },
      ticks: { color: '#a1a1aa' }
    }
  }
}))

const metricItems = computed(() => [
  { label: 'Period', value: `${history.value.length || '-'}M` },
  { label: 'Petrol', value: fuelAverage(history.value.at(-1), 'petrol') ? `R${fuelAverage(history.value.at(-1), 'petrol').toFixed(2)}` : '-' },
  { label: 'Diesel', value: fuelAverage(history.value.at(-1), 'diesel') ? `R${fuelAverage(history.value.at(-1), 'diesel').toFixed(2)}` : '-' }
])

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    if (!historyRequest) {
      historyRequest = cachedHistory
        ? Promise.resolve(cachedHistory)
        : request(endpoints.fuelHistory).then((payload) => {
            cachedHistory = payload
            return payload
          })
    }

    const payload = await historyRequest
    history.value = Array.isArray(payload?.months) ? payload.months : []
  } catch (chartError) {
    historyRequest = null
    error.value = chartError.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="flex min-h-screen flex-col py-10 sm:py-12">
    <div class="border-b border-line pb-3">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Petrol / Diesel Trend</h2>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-2 sm:mt-0">
          <div v-for="item in metricItems" :key="item.label" class="border-l border-line pl-3">
            <div class="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">{{ item.label }}</div>
            <div class="mt-1 font-mono text-sm text-fuel">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="min-h-0 flex-1 pt-4">
      <div v-if="loading" class="flex h-full items-center justify-center text-sm text-zinc-400">
        Loading chart data...
      </div>
      <div v-else-if="error" class="flex h-full items-center justify-center border-l border-red-700 bg-red-950/20 p-4 text-center text-sm text-red-200">
        {{ error }}
      </div>
      <div v-else-if="!history.length" class="flex h-full items-center justify-center border-l border-line text-center text-sm text-zinc-500">
        No chartable fuel history returned yet.
      </div>
      <Line v-else :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>
