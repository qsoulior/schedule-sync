<script setup lang="ts">
import { useAuth } from "@/services/azure/auth";
import { store as azureStore } from "@/services/azure/store";
import { store, Integration } from "@/store";
import IntegrationListItem from "@/components/IntegrationListItem.vue";
import IconUserCircle from "@/components/icons/IconUserCircle.vue";

const { signIn, signOut } = useAuth();

if (azureStore.account) {
  store.active = Integration.Graph;
}
</script>

<template>
  <div
    class="flex-1 md:flex-initial rounded border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-800/25 bg-zinc-50/25 p-5"
  >
    <div class="mb-5 flex flex-row items-center gap-1.5">
      <IconUserCircle class="h-5 w-5 dark:stroke-sky-300 stroke-sky-400" />
      <div>Аккаунты</div>
    </div>
    <div class="flex flex-col gap-y-3">
      <IntegrationListItem
        name="Outlook"
        :account="azureStore.account?.username"
        :active="store.active === Integration.Graph"
        @sign-in="signIn"
        @sign-out="signOut"
      />
      <IntegrationListItem
        name="Google (в разработке)"
        :disabled="true"
        :active="store.active === Integration.Google"
      />
    </div>
  </div>
</template>
