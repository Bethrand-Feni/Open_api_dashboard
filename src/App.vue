<script setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import QueryPanel from './components/QueryPanel.vue'
import ResultViewer from './components/ResultViewer.vue'
import { baseUrl, displayBaseUrl } from './services/openFuelApi'

gsap.registerPlugin(ScrollToPlugin)
gsap.registerPlugin(ScrollTrigger)

const FuelPriceChart = defineAsyncComponent(() => import('./components/FuelPriceChart.vue'))

const result = ref(null)
const loading = ref(false)
const error = ref('')
const demoSection = ref(null)
const chartSection = ref(null)
const chartReady = ref(false)
const apiReady = Boolean(baseUrl)
const apiStatusLabel = apiReady
  ? `Live API target: ${displayBaseUrl}`
  : 'Inactive: configure VITE_API_BASE_URL'

function handleResult(event) {
  result.value = event.payload
  loading.value = event.loading
  error.value = event.error
}

function scrollToDemo() {
  if (!demoSection.value) return

  gsap.to(window, {
    duration: 1.05,
    ease: 'power3.inOut',
    scrollTo: {
      y: demoSection.value,
      offsetY: 24
    }
  })
}

function scrollAfterQuery() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  const mobileChartLeadIn = chartSection.value
    ? chartSection.value.offsetTop - window.innerHeight + 24
    : window.scrollY + 180
  const targetY = window.innerWidth < 640 ? mobileChartLeadIn : window.scrollY + 180
  const nextY = Math.max(0, Math.min(targetY, maxScroll))

  gsap.to(window, {
    duration: 0.75,
    ease: 'power2.out',
    scrollTo: {
      y: nextY
    }
  })
}

onMounted(() => {
  gsap.from('.hero-mark', {
    opacity: 0,
    y: -16,
    duration: 0.8,
    ease: 'power2.out'
  })

  gsap.from('.hero-command', {
    opacity: 0,
    y: 28,
    duration: 0.9,
    delay: 0.15,
    ease: 'power3.out'
  })

  gsap.utils.toArray('.reveal-section').forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 18,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        once: true
      }
    })
  })

  if (!chartSection.value) return

  const chartObserver = new IntersectionObserver(
    ([entry], observer) => {
      if (!entry.isIntersecting) return
      chartReady.value = true
      observer.disconnect()
    },
    { rootMargin: '420px 0px' }
  )

  chartObserver.observe(chartSection.value)
})
</script>

<template>
  <main class="min-h-screen bg-carbon text-zinc-100">
    <section class="relative flex min-h-screen flex-col overflow-hidden px-5 py-6 sm:px-8 lg:px-10">
      <header class="pointer-events-none absolute left-0 top-0 z-20">
        <div class="group pointer-events-auto relative flex translate-x-4 translate-y-4 items-center sm:translate-x-5 sm:translate-y-5">
          <span
            class="status-dot block h-4 w-4 rounded-full sm:h-5 sm:w-5"
            :class="apiReady ? 'bg-fuel shadow-[0_0_22px_rgba(249,115,22,0.65)]' : 'bg-zinc-600 shadow-[0_0_14px_rgba(113,113,122,0.28)]'"
            aria-hidden="true"
          ></span>
          <div class="pointer-events-none absolute left-0 top-8 z-20 w-[min(78vw,22rem)] border border-line bg-carbon px-4 py-3 text-left opacity-0 shadow-glow transition group-hover:opacity-100 group-focus-within:opacity-100">
            <div class="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">API Status</div>
            <div class="text-xs text-zinc-300">{{ apiStatusLabel }}</div>
          </div>
        </div>
      </header>

      <div class="hero-command z-10 flex flex-1 items-center justify-center py-14">
        <div class="hero-content-shell w-full text-center">
          <div class="mb-10">
            <h1 class="hero-title font-black uppercase leading-none tracking-normal text-white">
              Open Fuel <span class="hero-title-highlight bg-fuel text-carbon">API</span>
            </h1>
            <p class="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-500 sm:text-lg">
              South African fuel price data, served through a live API.
            </p>
          </div>

          <QueryPanel @result="handleResult" @ran="scrollAfterQuery" />
        </div>
      </div>

      <button
        class="hero-mark absolute bottom-8 right-5 z-10 hidden origin-center rotate-90 items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-zinc-600 transition hover:text-fuel sm:flex sm:right-8"
        type="button"
        @click="scrollToDemo"
      >
        Scroll
        <span class="block h-px w-12 bg-current"></span>
      </button>
    </section>

    <section ref="demoSection" class="reveal-section px-5 sm:px-8 lg:px-10">
      <div class="mx-auto max-w-7xl">
        <ResultViewer :value="result" :loading="loading" :error="error" />
      </div>
    </section>

    <section ref="chartSection" class="reveal-section px-5 sm:px-8 lg:px-10">
      <div class="mx-auto max-w-7xl">
        <FuelPriceChart v-if="chartReady" />
        <section v-else class="flex min-h-screen flex-col py-10 sm:py-12">
          <div class="border-b border-line pb-3">
            <h2 class="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Petrol / Diesel Trend</h2>
          </div>
          <div class="flex flex-1 items-center justify-center pt-4 text-sm text-zinc-500">
            Preparing chart...
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
