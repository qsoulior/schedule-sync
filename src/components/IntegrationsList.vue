<script setup lang="ts">
import { useAuth } from "@/services/azure/auth";
import { store } from "@/services/azure/store";

const { signIn, signOut } = useAuth();
</script>

<template>
  <button @click="signIn">Войти</button>
  <button @click="signOut">Выйти</button>
  <div>{{ store.account?.username }}</div>
</template>
