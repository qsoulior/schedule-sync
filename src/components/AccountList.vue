<script setup lang="ts">
import { useAuth } from "@/composables/azure/auth";
import { useAzureStore } from "@/stores/azure";
import AccountListItem from "@/components/AccountListItem.vue";
import IconUserCircle from "@/components/icons/IconUserCircle.vue";

const azureStore = useAzureStore();
const { signIn, signOut } = useAuth();
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
      <AccountListItem
        name="Outlook"
        :account="azureStore.account?.username"
        :active="true"
        @sign-in="signIn"
        @sign-out="signOut"
      />
      <AccountListItem name="Google (в разработке)" :disabled="true" :active="false" />
    </div>
  </div>
</template>
