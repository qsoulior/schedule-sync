<script setup lang="ts">
import { useGraph } from "@/services/azure/graph";
import { useFetcher } from "@/services/schedule/fetcher";

const { schedulesInfo, filteredSchedulesInfo, searchedGroup, getSchedule } = useFetcher();
const { status, createdPercents, createSchedule } = useGraph();

async function test(group: string) {
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
      {{ status }}
      <div>{{ filteredSchedulesInfo.length }} / {{ schedulesInfo.length }}</div>
      <button @click="test(schedule.group)" v-for="schedule of filteredSchedulesInfo" :key="schedule.group">
        {{ schedule.group }}
        {{ schedule.modified.toLocaleDateString() }}
      </button>
    </div>
  </div>
</template>
