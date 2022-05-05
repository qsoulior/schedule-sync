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
  <div
    class="flex min-w-[15rem] cursor-pointer flex-row items-center justify-between gap-5 rounded bg-zinc-800 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-800"
    :class="active ? 'bg-sky-300/20' : 'hover:bg-zinc-700/50 active:bg-zinc-700/75'"
    :disabled="disabled"
  >
    <div class="flex w-full flex-col" @click="if (!props.account) emit('signIn');">
      <div class="text-sky-300">{{ props.name }}</div>
      <div>{{ props.account }}</div>
    </div>
    <div v-if="props.account" class="hover:text-sky-300" @click="emit('signOut')">
      <IconLogout class="h-5 w-5" />
    </div>
  </div>
</template>
