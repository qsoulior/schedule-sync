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
    class="rounded dark:bg-zinc-800 bg-zinc-100 px-3 py-1.5 placeholder:dark:text-zinc-400/75 placeholder:text-zinc-500 focus:dark:bg-sky-300/10 focus:bg-sky-400/5 focus:outline-none border-solid border border-transparent focus:dark:border-sky-300 focus:border-sky-400 focus:shadow-[0_0_10px_-2px] focus:dark:shadow-sky-300/30 focus:shadow-sky-400/30 dark:caret-sky-300 caret-sky-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ease-in-out"
    :placeholder="placeholder"
    :type="type"
    :disabled="disabled"
    v-model="value"
  />
</template>
