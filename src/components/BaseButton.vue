<script setup lang="ts">
interface Props {
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
});
</script>

<template>
  <button
    class="rounded dark:bg-zinc-800 bg-zinc-100 text-center"
    :class="
      disabled
        ? 'cursor-not-allowed opacity-50'
        : 'cursor-pointer hover:dark:bg-zinc-700/50 hover:bg-zinc-200/50 active:dark:bg-zinc-700/75 active:bg-zinc-200/75'
    "
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>
