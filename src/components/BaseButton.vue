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
    class="rounded bg-zinc-800 text-center"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-zinc-700/50 active:bg-zinc-700/75'"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>
