<script setup lang="ts">
import { GraphAPI, parseEvent } from "@/services/azure/graph";
import type { Calendar } from "@/services/azure/graphConfig";
import { useFetcher } from "@/services/schedule/fetcher";
import { store } from "@/store";

const { schedulesInfo, filteredSchedulesInfo, searchedGroup, getSchedule } = useFetcher();

async function fetchCalendar(name: string): Promise<Calendar> {
  if (!store.accessToken) throw new Error("accessToken is undefined");
  const graphAPI = new GraphAPI(store.accessToken);
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

async function test(group: string) {
  if (!store.accessToken) throw new Error("accessToken is undefined");
  const schedule = await getSchedule(group);
  const calendar = await fetchCalendar(group);
  const graphApi = new GraphAPI(store.accessToken);
  for (let scheduleEvent of schedule.events) {
    const calendarEvents = await parseEvent(scheduleEvent);
    for (let calendarEvent of calendarEvents) {
      graphApi.createEvent(calendarEvent, calendar.id);
    }
  }
}
</script>

<template>
  <div>
    <div>
      <input type="text" v-model="searchedGroup" />
    </div>
    <div>
      <div>{{ filteredSchedulesInfo.length }} / {{ schedulesInfo.length }}</div>
      <button @click="test(schedule.group)" v-for="schedule of filteredSchedulesInfo" :key="schedule.group">
        {{ schedule.group }}
        {{ schedule.modified.toLocaleDateString() }}
      </button>
    </div>
    {{ store.accessToken }}
  </div>
</template>
