<script setup lang="ts">
import { computed } from "vue";

interface Props {
  percentage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0,
});

const percentage = computed<number>(() => Math.round(props.percentage));
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="h-2 flex-auto bg-zinc-700 rounded">
      <div
        class="h-2 bg-sky-300 rounded transition-all duration-500 ease-linear"
        :style="{ width: percentage + '%' }"
      ></div>
    </div>
    <div>{{ percentage }}%</div>
  </div>
</template>
