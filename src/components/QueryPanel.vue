<script setup>
import { computed, ref } from 'vue'
import { endpoints, buildUrl, request } from '../services/openFuelApi'
import { fuelLabels, locationLabels } from '../utils/fuelData'

const emit = defineEmits(['result', 'ran'])

const queryType = ref('allFuel')
const fuelType = ref('unleaded95')
const location = ref('inland')
const newsFuelType = ref('petrol')
const loading = ref(false)
const error = ref('')
const slowRequest = ref(false)
const menuOpen = ref(false)
const fuelMenuOpen = ref(false)
const locationMenuOpen = ref(false)

const queryOptions = [
  { id: 'allFuel', label: 'GET ALL FUEL PRICES' },
  { id: 'fuelByTypeLocation', label: 'GET FUEL PRICE BY TYPE + LOCATION' },
  { id: 'allNews', label: 'GET ALL NEWS SUMMARIES' },
  { id: 'newsByFuelType', label: 'GET NEWS BY FUEL TYPE' }
]

const fuelTypes = Object.keys(fuelLabels)
const locations = Object.keys(locationLabels)

const endpointPath = computed(() => {
  if (queryType.value === 'fuelByTypeLocation') {
    return endpoints.fuelByTypeLocation(fuelType.value, location.value)
  }
  if (queryType.value === 'allNews') return endpoints.allNews
  if (queryType.value === 'newsByFuelType') return endpoints.newsByFuelType(newsFuelType.value)
  return endpoints.allFuel
})

const endpointUrl = computed(() => buildUrl(endpointPath.value))
const selectedQuery = computed(() => queryOptions.find((option) => option.id === queryType.value) || queryOptions[0])

function toggleCommandMenu() {
  menuOpen.value = !menuOpen.value
  fuelMenuOpen.value = false
  locationMenuOpen.value = false
}

function toggleFuelMenu() {
  fuelMenuOpen.value = !fuelMenuOpen.value
  menuOpen.value = false
  locationMenuOpen.value = false
}

function toggleLocationMenu() {
  locationMenuOpen.value = !locationMenuOpen.value
  menuOpen.value = false
  fuelMenuOpen.value = false
}

function selectQuery(id) {
  queryType.value = id
  menuOpen.value = false
  fuelMenuOpen.value = false
  locationMenuOpen.value = false
}

function selectFuelType(type) {
  fuelType.value = type
  fuelMenuOpen.value = false
}

function selectLocation(value) {
  location.value = value
  locationMenuOpen.value = false
}

async function runQuery() {
  loading.value = true
  slowRequest.value = false
  error.value = ''
  const slowRequestTimer = window.setTimeout(() => {
    slowRequest.value = true
  }, 10000)

  emit('result', { payload: null, loading: true, error: '' })
  emit('ran')

  try {
    const payload = await request(endpointPath.value)
    emit('result', { payload, loading: false, error: '' })
  } catch (requestError) {
    error.value = requestError.message
    emit('result', { payload: null, loading: false, error: requestError.message })
  } finally {
    window.clearTimeout(slowRequestTimer)
    loading.value = false
    slowRequest.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-600 sm:text-xs">Select Command</p>

    <div class="flex w-full items-center justify-center gap-3">
      <div class="group relative hidden shrink-0 sm:block">
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-carbon/80 font-mono text-[11px] font-bold normal-case tracking-normal text-fuel outline-none transition hover:border-fuel hover:bg-panel focus:border-fuel sm:h-8 sm:w-8"
          aria-label="Show endpoint"
        >
          i
        </button>
        <div class="pointer-events-none absolute left-0 top-9 z-20 w-[min(82vw,28rem)] border border-line bg-carbon px-4 py-3 text-left opacity-0 shadow-glow transition group-hover:opacity-100 group-focus-within:opacity-100 sm:top-10">
          <div class="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Endpoint</div>
          <div class="break-all font-mono text-xs normal-case tracking-normal text-fuel">{{ endpointUrl || endpointPath }}</div>
        </div>
      </div>

      <div class="group relative min-w-0 flex-1 sm:max-w-xl">
        <button
          type="button"
          class="command-select peer flex h-11 w-full items-center justify-between border border-line bg-transparent px-4 text-left font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100 outline-none transition hover:border-fuel/60 hover:text-fuel focus:border-fuel focus:text-fuel sm:h-12 sm:text-sm"
          aria-haspopup="listbox"
          :aria-expanded="menuOpen"
          @click="toggleCommandMenu"
        >
          <span class="min-w-0 truncate">{{ selectedQuery.label }}</span>
        </button>
        <span class="command-arrow pointer-events-none absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center font-mono text-fuel transition peer-hover:translate-y-[-45%] peer-focus:translate-y-[-45%]">
          ▾
        </span>
        <div
          v-if="menuOpen"
          class="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-full border border-line bg-carbon py-1 text-left shadow-glow"
          role="listbox"
        >
          <button
            v-for="option in queryOptions"
            :key="option.id"
            type="button"
            class="flex w-full items-center justify-between px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:bg-panel hover:text-fuel sm:text-xs"
            :class="queryType === option.id ? 'text-fuel' : 'text-zinc-400'"
            role="option"
            :aria-selected="queryType === option.id"
            @click="selectQuery(option.id)"
          >
            <span>{{ option.label }}</span>
            <span v-if="queryType === option.id" class="h-1.5 w-1.5 rounded-full bg-fuel"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6 flex w-full max-w-xl flex-col gap-4">
      <div v-if="queryType === 'fuelByTypeLocation'" class="mx-auto grid w-4/5 max-w-[26rem] gap-3">
        <label class="space-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Fuel Type
          <div class="relative">
            <button
              type="button"
              class="sub-select peer flex h-11 w-full items-center justify-center border-0 border-b border-line bg-transparent px-1 font-mono text-xs font-semibold normal-case tracking-[0.08em] text-zinc-100 outline-none transition"
              aria-haspopup="listbox"
              :aria-expanded="fuelMenuOpen"
              @click="toggleFuelMenu"
            >
              <span class="min-w-0 truncate">{{ fuelType }}</span>
            </button>
            <span class="pointer-events-none absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center font-mono text-fuel transition peer-hover:translate-y-[-45%] peer-focus:translate-y-[-45%]">
              ▾
            </span>
            <div
              v-if="fuelMenuOpen"
              class="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-full border border-line bg-carbon py-1 text-center shadow-glow"
              role="listbox"
            >
              <button
                v-for="type in fuelTypes"
                :key="type"
                type="button"
                class="flex w-full items-center justify-center px-3 py-2.5 font-mono text-xs font-semibold normal-case tracking-[0.08em] transition hover:bg-panel hover:text-fuel"
                :class="fuelType === type ? 'text-fuel' : 'text-zinc-100'"
                role="option"
                :aria-selected="fuelType === type"
                @click="selectFuelType(type)"
              >
                {{ type }}
              </button>
            </div>
          </div>
        </label>

        <label class="space-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Location
          <div class="relative">
            <button
              type="button"
              class="sub-select peer flex h-11 w-full items-center justify-center border-0 border-b border-line bg-transparent px-1 font-mono text-xs font-semibold normal-case tracking-[0.08em] text-zinc-100 outline-none transition"
              aria-haspopup="listbox"
              :aria-expanded="locationMenuOpen"
              @click="toggleLocationMenu"
            >
              <span class="min-w-0 truncate">{{ location }}</span>
            </button>
            <span class="pointer-events-none absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center font-mono text-fuel transition peer-hover:translate-y-[-45%] peer-focus:translate-y-[-45%]">
              ▾
            </span>
            <div
              v-if="locationMenuOpen"
              class="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-full border border-line bg-carbon py-1 text-center shadow-glow"
              role="listbox"
            >
              <button
                v-for="item in locations"
                :key="item"
                type="button"
                class="flex w-full items-center justify-center px-3 py-2.5 font-mono text-xs font-semibold normal-case tracking-[0.08em] transition hover:bg-panel hover:text-fuel"
                :class="location === item ? 'text-fuel' : 'text-zinc-100'"
                role="option"
                :aria-selected="location === item"
                @click="selectLocation(item)"
              >
                {{ item }}
              </button>
            </div>
          </div>
        </label>
      </div>

      <div v-if="queryType === 'newsByFuelType'" class="mx-auto grid w-full max-w-sm grid-cols-2 gap-2">
        <button
          v-for="item in ['petrol', 'diesel']"
          :key="item"
          type="button"
          class="h-11 border-b text-sm uppercase tracking-[0.16em] transition"
          :class="newsFuelType === item ? 'border-fuel text-fuel' : 'border-line text-zinc-500 hover:border-fuel/70 hover:text-zinc-200'"
          @click="newsFuelType = item"
        >
          {{ item }}
        </button>
      </div>

      <button
        type="button"
        class="mx-auto flex h-10 w-auto min-w-40 items-center justify-center border border-fuel bg-fuel px-5 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-fuel disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="runQuery"
      >
        {{ loading ? 'Running...' : 'Run Query' }}
      </button>

      <p v-if="slowRequest" class="mx-auto max-w-xs font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
        API server might be starting from cold start, please wait
      </p>

      <p v-if="error" class="text-sm text-red-300">{{ error }}</p>
    </div>
  </section>
</template>
