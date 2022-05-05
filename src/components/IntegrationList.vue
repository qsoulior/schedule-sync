<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "@/services/azure/auth";
import { store } from "@/services/azure/store";
import IconCube from "@/components/icons/IconCube.vue";
import IntegrationListItem from "@/components/IntegrationListItem.vue";

const { signIn, signOut } = useAuth();
const active = ref<string>("");
</script>

<template>
  <div class="rounded border border-zinc-800 bg-zinc-800/25 p-5">
    <div class="mb-5 flex flex-row items-center gap-1.5">
      <IconCube class="h-5 w-5 stroke-sky-300" />
      <div>Интеграции</div>
    </div>
    <div class="flex flex-col gap-y-3">
      <IntegrationListItem
        name="Outlook"
        :account="store.account?.username"
        :active="active === 'Outlook'"
        @click="active = 'Outlook'"
        @sign-in="signIn"
        @sign-out="signOut"
      />
      <IntegrationListItem name="Google" :active="active === 'Google'" @click="active = 'Google'" />
    </div>
  </div>
</template>
