<script setup lang="ts">
import { useAuth } from "@/services/azure/auth";
import { graphConfig } from "@/services/azure/authConfig";

const { account, accessToken, signIn, signOut, acquireToken } = useAuth();

async function createCalendar(): Promise<void> {
  const response = await fetch(graphConfig.meEndpoint + "/calendars", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify({
      name: "Test",
    }),
  });

  const result = await response.json();
  console.log(result);
}
</script>

<template>
  <button @click="signIn">Войти</button>
  <button @click="signOut">Выйти</button>
  <button @click="acquireToken">Получить токен</button>
  <button @click="createCalendar">Создать календарь</button>
  <div>{{ account?.username }}</div>
</template>
