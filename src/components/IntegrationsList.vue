<script setup lang="ts">
import { AuthServicePopup } from "@/services/azure/authPopup";
import type { AccountInfo } from "@azure/msal-common";
import { ref } from "vue";

const authService = new AuthServicePopup();
const account = ref<AccountInfo | null>();
</script>

<template>
  <button
    @click="
      async () => {
        await authService.signIn();
        account = authService.getActiveAccount();
      }
    "
  >
    Войти
  </button>
  <button
    @click="
      async () => {
        await authService.signOut();
        account = null;
      }
    "
  >
    Выйти
  </button>
  <div>{{ account?.username }}</div>
</template>
