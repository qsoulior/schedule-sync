<script setup lang="ts">
import { useAuth } from "@/services/azure/auth";
import { store as azureStore } from "@/services/azure/store";
import { store, Integration } from "@/store";
import IconCube from "@/components/icons/IconCube.vue";
import IntegrationListItem from "@/components/IntegrationListItem.vue";

const { signIn, signOut } = useAuth();
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
        :account="azureStore.account?.username"
        :active="store.active === Integration.Graph"
        @click="store.active = Integration.Graph"
        @sign-in="signIn"
        @sign-out="signOut"
      />
      <IntegrationListItem name="Google" :disabled="true" :active="store.active === Integration.Google" />
    </div>
  </div>
</template>
