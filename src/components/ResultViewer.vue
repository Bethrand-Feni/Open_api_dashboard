<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null
  },
  loading: Boolean,
  error: {
    type: String,
    default: ''
  }
})

const expanded = ref(false)

const formattedValue = computed(() => JSON.stringify(props.value, null, 2))
const shouldClamp = computed(() => formattedValue.value.length > 900)

watch(
  () => props.value,
  () => {
    expanded.value = false
  }
)
</script>

<template>
  <section class="flex flex-col py-8 sm:py-10">
    <div class="flex items-center justify-between border-b border-line pb-3">
      <h2 class="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Response</h2>
      <span class="font-mono text-xs text-zinc-500">JSON</span>
    </div>

    <div class="flex min-h-0 pt-4">
      <div v-if="loading" class="flex min-h-56 flex-1 items-center justify-center text-sm text-zinc-400">
        Running request...
      </div>

      <div v-else-if="error" class="flex min-h-56 w-full items-center justify-center border-l border-red-700 bg-red-950/20 p-4 text-center text-sm text-red-200">
        {{ error }}
      </div>

      <div v-else-if="value === null" class="flex min-h-56 flex-1 items-center justify-center">
        <div class="w-full max-w-xl border-l border-line pl-4 text-left font-mono text-xs leading-6 text-zinc-600">
          <div class="text-zinc-500">{</div>
          <div class="pl-4"><span class="text-zinc-500">"status"</span>: <span class="text-fuel/70">"waiting"</span>,</div>
          <div class="pl-4"><span class="text-zinc-500">"query"</span>: <span class="text-zinc-400">null</span>,</div>
          <div class="pl-4"><span class="text-zinc-500">"payload"</span>: <span class="text-zinc-400">[]</span></div>
          <div class="text-zinc-500">}</div>
          <div class="mt-4 font-sans text-sm text-zinc-500">Run a command to inspect the live API response.</div>
        </div>
      </div>

      <div v-else class="w-full">
        <pre
          class="w-full overflow-auto whitespace-pre-wrap break-words border-l border-line pl-4 font-mono text-xs leading-6 text-zinc-200 transition-[max-height]"
          :class="expanded ? 'max-h-[72vh]' : 'max-h-72'"
        >{{ formattedValue }}</pre>

        <div v-if="shouldClamp" class="mt-4 flex justify-center">
          <button
            type="button"
            class="border border-line px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 transition hover:border-fuel hover:text-fuel"
            @click="expanded = !expanded"
          >
            {{ expanded ? 'Show Less' : 'Show More' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
