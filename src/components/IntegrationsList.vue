<script setup lang="ts">
import { useAuth } from "@/services/azure/auth";
import { GraphAPI, type Calendar } from "@/services/azure/graph";

const { account, accessToken, signIn, signOut, acquireToken } = useAuth();

async function fetchCalendar(name: string): Promise<Calendar> {
  if (!accessToken.value) throw new Error("accessToken is undefined");
  const graphAPI = new GraphAPI(accessToken.value);
  let calendarGroup = await graphAPI.getCalendarGroup("schdl");
  let calendar: Calendar | null;
  if (calendarGroup === null) {
    calendarGroup = await graphAPI.createCalendarGroup("schdl");
    calendar = await graphAPI.createCalendar(name, calendarGroup.id);
    return calendar;
  }
  calendar = await graphAPI.getCalendar(name, calendarGroup.id);
  if (calendar === null) {
    calendar = await graphAPI.createCalendar(name, calendarGroup.id);
  }
  return calendar;
}
</script>

<template>
  <button @click="signIn">Войти</button>
  <button @click="signOut">Выйти</button>
  <button @click="acquireToken">Получить токен</button>
  <button @click="fetchCalendar('Test123')">Создать календарь</button>
  <div>{{ account?.username }}</div>
</template>
