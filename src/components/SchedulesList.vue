<script setup lang="ts">
import { useFetcher } from "@/services/schedule/fetcher";

const { schedulesInfo, filteredSchedulesInfo, searchedGroup, getSchedule } =
  useFetcher();
</script>

<template>
  <div>
    <div>
      <input type="text" v-model="searchedGroup" />
    </div>
    <div>
      <div>{{ filteredSchedulesInfo.length }} / {{ schedulesInfo.length }}</div>
      <button
        @click="getSchedule(schedule.group)"
        v-for="schedule of filteredSchedulesInfo"
        :key="schedule.group"
      >
        {{ schedule.group }}
        {{ schedule.modified.toLocaleDateString() }}
      </button>
    </div>
  </div>
</template>
