<script setup lang="ts">
import { useAzureToken } from "@/services/azure/auth";
import { useAzureGraph } from "@/services/azure/graph";
import { useScheduleFetcher } from "@/services/schedule/fetcher";
import IconCalendar from "@/components/icons/IconCalendar.vue";

const { schedulesInfo, filteredSchedulesInfo, searchedGroup, getSchedule } = useScheduleFetcher();
const { statusMessage, createdPercents, createSchedule } = useAzureGraph();
const { acquireToken } = useAzureToken();

async function test(group: string) {
  await acquireToken();
  const schedule = await getSchedule(group);
  await createSchedule(group, schedule.events);
}
</script>

<template>
  <div class="w-[46rem] rounded border border-zinc-800 bg-zinc-800/25 p-5">
    <div class="mb-5 flex flex-row items-center gap-1.5">
      <IconCalendar class="h-5 w-5 stroke-sky-300" />
      <div>Расписания ({{ filteredSchedulesInfo.length }}/{{ schedulesInfo.length }})</div>
    </div>
    <form class="mb-5 w-full" @submit.prevent>
      <input
        class="w-full rounded-l bg-zinc-800 px-3 py-1.5 placeholder:text-zinc-400/75 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Название группы"
        type="search"
        v-model="searchedGroup"
      />
    </form>
    <div v-if="filteredSchedulesInfo.length > 0" class="grid grid-cols-4 gap-3">
      <button
        v-for="schedule of filteredSchedulesInfo"
        :key="schedule.group"
        @click="test(schedule.group)"
        class="cursor-pointer rounded bg-zinc-800 px-4 py-2 text-center hover:bg-zinc-700/50 disabled:cursor-not-allowed disabled:bg-gray-800"
      >
        <div>{{ schedule.group }}</div>
        <div class="text-xs">{{ schedule.modified.toLocaleDateString() }}</div>
      </button>
    </div>
    <div v-else>Расписания не найдены</div>
  </div>
</template>
