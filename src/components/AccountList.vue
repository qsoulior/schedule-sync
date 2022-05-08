<script setup lang="ts">
import { accountStore, AccountType } from "@/stores/account";
import { azureStore } from "@/stores/azure";
import { useAzureAuth } from "@/composables/azure/auth";
// import { googleStore } from "@/stores/google";
// import { useGoogleAuth } from "@/composables/google/auth";
import AccountListItem from "@/components/AccountListItem.vue";
import IconUserCircle from "@/components/icons/IconUserCircle.vue";

const azureContext = useAzureAuth();
// const googleContext = useGoogleAuth();

if (azureStore.account !== null) {
  accountStore.selected = AccountType.Azure;
}
// else if (googleStore.account !== null)
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
        :selected="accountStore.selected === AccountType.Azure"
        @click="accountStore.selected = AccountType.Azure"
        @sign-in="azureContext.signIn()"
        @sign-out="azureContext.signOut()"
      />
      <AccountListItem
        name="Google"
        :selected="accountStore.selected === AccountType.Google"
        @click="accountStore.selected = AccountType.Google"
      />
    </div>
  </div>
</template>
