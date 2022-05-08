<script setup lang="ts">
import IconLogout from "@/components/icons/IconLogout.vue";

const props = defineProps<{
  name: string;
  account?: string;
  selected?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "signIn"): void;
  (e: "signOut"): void;
}>();

function signIn(e: MouseEvent): void {
  if (!props.account) {
    e.stopPropagation();
    emit("signIn");
  }
}

function signOut(e: MouseEvent): void {
  if (props.account) {
    e.stopPropagation();
    emit("signOut");
  }
}
</script>

<template>
  <button
    class="flex min-w-[15rem] flex-row items-center justify-between gap-5 rounded dark:bg-zinc-800 bg-zinc-100 px-4 py-2"
    :class="[
      selected
        ? 'dark:bg-sky-300/10 bg-sky-400/10'
        : !disabled
        ? 'hover:dark:bg-zinc-700/50 hover:bg-zinc-200/50 active:dark:bg-zinc-700/75 active:bg-zinc-200/75'
        : '',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    ]"
    @click="signIn"
  >
    <div class="flex w-full flex-col items-start">
      <div class="dark:text-sky-300 text-sky-400">{{ props.name }}</div>
      <div>{{ props.account }}</div>
    </div>
    <div v-if="props.account" class="hover:dark:text-sky-300 hover:text-sky-400" @click="signOut">
      <IconLogout class="h-5 w-5" />
    </div>
  </button>
</template>
