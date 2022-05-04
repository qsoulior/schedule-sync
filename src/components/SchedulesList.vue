<script setup lang="ts">
import { useAzureToken } from "@/services/azure/auth";
import { useAzureGraph } from "@/services/azure/graph";
import { useScheduleFetcher } from "@/services/schedule/fetcher";

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
  <div>
    <div>
      <input type="text" v-model="searchedGroup" />
    </div>
    <div>
      {{ createdPercents }}
      {{ statusMessage }}
      <div>{{ filteredSchedulesInfo.length }} / {{ schedulesInfo.length }}</div>
      <button @click="test(schedule.group)" v-for="schedule of filteredSchedulesInfo" :key="schedule.group">
        {{ schedule.group }}
        {{ schedule.modified.toLocaleDateString() }}
      </button>
    </div>
  </div>
</template>
