<script setup lang="ts">
import { accountStore, AccountType } from "@/stores/account";
import { useGraphAuth } from "@/composables/graph/auth";
import { useGoogleAuth } from "@/composables/google/auth";
import AccountListItem from "@/components/AccountListItem.vue";
import IconUserCircle from "@/components/icons/IconUserCircle.vue";

const graphContext = useGraphAuth();
const googleContext = useGoogleAuth();

if (accountStore.graph !== null) {
  accountStore.selected = AccountType.Graph;
} else if (accountStore.google !== null) {
  accountStore.selected = AccountType.Google;
}

function selectAccount(type: AccountType) {
  if (type === AccountType.Graph && accountStore.graph) {
    accountStore.selected = AccountType.Graph;
  } else if (type === AccountType.Google && accountStore.google) {
    accountStore.selected = AccountType.Google;
  }
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
      <AccountListItem
        name="Outlook"
        :account="accountStore.graph?.username"
        :selected="accountStore.selected === AccountType.Graph"
        @click="selectAccount(AccountType.Graph)"
        @sign-in="graphContext.signIn"
        @sign-out="graphContext.signOut"
      />
      <AccountListItem
        name="Google"
        :account="accountStore.google ?? undefined"
        :selected="accountStore.selected === AccountType.Google"
        @click="selectAccount(AccountType.Google)"
        @sign-in="googleContext.signIn"
        @sign-out="googleContext.signOut"
      />
    </div>
  </div>
</template>
