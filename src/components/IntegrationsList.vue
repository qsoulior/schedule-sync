<script setup lang="ts">
import { useAuth } from "@/services/azure/auth";

const { account, signIn, signOut, acquireToken } = useAuth();
</script>

<template>
  <button @click="signIn">Войти</button>
  <button @click="signOut">Выйти</button>
  <button @click="acquireToken">Получить токен</button>
  <div>{{ account?.username }}</div>
</template>
