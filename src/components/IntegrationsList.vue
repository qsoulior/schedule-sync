<script setup lang="ts">
import { useAuth } from "@/services/azure/auth";
import { graphConfig } from "@/services/azure/authConfig";
import { onMounted } from "vue";

const { account, accessToken, signIn, signOut, acquireToken } = useAuth();

onMounted(async () => {
  await acquireToken();
  const response = await fetch(graphConfig.meEndpoint + "/calendars", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Test",
    }),
  });

  const result = await response.json();
  console.log(result);
});
</script>

<template>
  <button @click="signIn">Войти</button>
  <button @click="signOut">Выйти</button>
  <button @click="acquireToken">Получить токен</button>
  <div>{{ account?.username }}</div>
  <div>{{ accessToken }}</div>
</template>
