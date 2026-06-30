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
import { normalizeFuelRows } from '../utils/fuelData'

ChartJS.register(CategoryScale, Filler, LinearScale, LineElement, PointElement, Legend, Tooltip)

const loading = ref(true)
const error = ref('')
const rows = ref([])
const news = ref(null)

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const fallbackReasons = {
  petrol: [
    'International oil prices placed upward pressure on petrol.',
    'Exchange-rate movement softened the monthly increase.',
    'Refinery and transport costs lifted the inland price.',
    'Slate levy adjustments kept the price curve elevated.',
    'Demand recovered ahead of winter travel periods.',
    'Latest API news summary will replace this placeholder once history is available.'
  ],
  diesel: [
    'Distillate supply tightened across regional markets.',
    'Freight and logistics demand supported diesel pricing.',
    'Global refinery margins pushed diesel higher.',
    'Currency pressure added to the local pump price.',
    'Winter demand increased wholesale diesel costs.',
    'Latest API news summary will replace this placeholder once history is available.'
  ]
}

function getLatestPrice(fuelType) {
  const inland = rows.value.find((row) => row.fuelType === fuelType && row.location === 'inland')
  const coast = rows.value.find((row) => row.fuelType === fuelType && row.location === 'coast')
  return inland?.price ?? coast?.price ?? null
}

function buildTrend(latestPrice, offsets) {
  if (!latestPrice) return offsets.map(() => null)
  return offsets.map((offset) => Number((latestPrice + offset).toFixed(2)))
}

function reasonFor(type, index) {
  const apiSummary = type === 'petrol' ? news.value?.petrol : news.value?.diesel
  if (index === monthLabels.length - 1 && apiSummary) return apiSummary
  return fallbackReasons[type][index]
}

const chartData = computed(() => {
  const petrolLatest = getLatestPrice('unleaded95')
  const dieselLatest = getLatestPrice('diesel50') ?? getLatestPrice('diesel500')

  return {
    labels: monthLabels,
    datasets: [
      {
        label: 'Petrol',
        data: buildTrend(petrolLatest, [-1.35, -1.02, -0.62, -0.28, 0.12, 0]),
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
        data: buildTrend(dieselLatest, [-1.1, -0.85, -0.45, -0.16, 0.18, 0]),
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
  { label: 'Period', value: '6M' },
  { label: 'Petrol', value: getLatestPrice('unleaded95') ? `R${getLatestPrice('unleaded95').toFixed(2)}` : '-' },
  { label: 'Diesel', value: (getLatestPrice('diesel50') ?? getLatestPrice('diesel500')) ? `R${(getLatestPrice('diesel50') ?? getLatestPrice('diesel500')).toFixed(2)}` : '-' }
])

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    const [fuelPayload, newsPayload] = await Promise.all([
      request(endpoints.allFuel),
      request(endpoints.allNews)
    ])
    rows.value = normalizeFuelRows(fuelPayload)
    news.value = newsPayload
  } catch (chartError) {
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
      <div v-else-if="!rows.length" class="flex h-full items-center justify-center border-l border-line text-center text-sm text-zinc-500">
        No chartable petrol or diesel data returned yet.
      </div>
      <Line v-else :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>
