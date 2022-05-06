<script setup lang="ts">
import IconLogout from "@/components/icons/IconLogout.vue";

const props = defineProps<{
  name: string;
  account?: string;
  active?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "signIn"): void;
  (e: "signOut"): void;
}>();
</script>

<template>
  <button
    class="flex min-w-[15rem] flex-row items-center justify-between gap-5 rounded bg-zinc-800 px-4 py-2"
    :class="[
      active ? 'bg-sky-300/10' : !disabled ? 'hover:bg-zinc-700/50 active:bg-zinc-700/75' : '',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    ]"
  >
    <div class="flex w-full flex-col items-start" @click="if (!props.account) emit('signIn');">
      <div class="text-sky-300">{{ props.name }}</div>
      <div>{{ props.account }}</div>
    </div>
    <div v-if="props.account" class="hover:text-sky-300" @click="emit('signOut')">
      <IconLogout class="h-5 w-5" />
    </div>
  </button>
</template>
