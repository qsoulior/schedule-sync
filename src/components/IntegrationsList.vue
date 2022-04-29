<script setup lang="ts">
import { useAuth } from "@/services/azure/auth";

const { account, token, signIn, signOut, getToken } = useAuth();
</script>

<template>
  <button @click="signIn">Войти</button>
  <button @click="signOut">Выйти</button>
  <button @click="getToken">Получить токен</button>
  <div>{{ account?.username }}</div>
  <div>{{ token }}</div>
</template>
