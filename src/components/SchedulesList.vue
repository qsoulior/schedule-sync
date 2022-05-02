<script setup lang="ts">
import { useFetcher } from "@/services/schedule/fetcher";

const { schedulesInfo, filteredSchedulesInfo, searchedGroup, getSchedule } = useFetcher();

async function test(group: string) {
  const schedule = await getSchedule(group);
  console.log(schedule);
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
  </div>
</template>
