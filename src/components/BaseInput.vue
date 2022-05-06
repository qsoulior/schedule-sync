<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue?: string;
  placeholder?: string;
  type?: "text" | "search" | "textarea";
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value?: string): void;
}>();

const value = computed<string | undefined>({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <input
    class="rounded bg-zinc-800 px-3 py-1.5 placeholder:text-zinc-400/75 focus:bg-sky-300/10 focus:outline-none border-solid border border-transparent focus:border-sky-300 focus:shadow-[0_0_10px_-2px] focus:shadow-sky-300/30 caret-sky-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ease-in-out"
    :placeholder="placeholder"
    :type="type"
    :disabled="disabled"
    v-model="value"
  />
</template>
