<script setup lang="ts">
import { ref } from "vue";
import { useAzureToken } from "@/services/azure/auth";
import { useAzureGraph } from "@/services/azure/graph";
import { useScheduleFetcher } from "@/services/schedule/fetcher";
import BaseInput from "@/components/BaseInput.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseProgressBar from "@/components/BaseProgressBar.vue";
import IconCalendar from "@/components/icons/IconCalendar.vue";

const { schedulesInfo, filteredSchedulesInfo, searchedGroup, getSchedule } = useScheduleFetcher();
const { statusMessage, createdPercentage, createSchedule } = useAzureGraph();
const { acquireToken } = useAzureToken();

enum Status {
  Init,
  Pending,
  Success,
  Error,
}

const currentStatus = ref<Status>(Status.Init);

async function syncSchedule(group: string): Promise<void> {
  currentStatus.value = Status.Pending;
  try {
    await acquireToken();
    const schedule = await getSchedule(group);
    await createSchedule(group, schedule.events);
    currentStatus.value = Status.Success;
  } catch (error) {
    console.log(error);
    currentStatus.value = Status.Error;
  }
}
</script>

<template>
  <div class="w-[46rem] rounded border border-zinc-800 bg-zinc-800/25 p-5">
    <div class="mb-5 flex flex-row items-center gap-1.5">
      <IconCalendar class="h-5 w-5 stroke-sky-300" />
      <div>Расписания ({{ filteredSchedulesInfo.length }}/{{ schedulesInfo.length }})</div>
    </div>
    <form class="mb-5 w-full" @submit.prevent>
      <BaseInput
        class="w-full"
        type="search"
        placeholder="Название группы"
        :disabled="currentStatus !== Status.Init"
        v-model="searchedGroup"
      />
    </form>
    <div v-if="currentStatus === Status.Init">
      <div v-if="filteredSchedulesInfo.length > 0" class="flex flex-wrap gap-3">
        <BaseButton
          class="px-4 py-2 flex-1"
          v-for="schedule of filteredSchedulesInfo"
          :key="schedule.group"
          @click="syncSchedule(schedule.group)"
        >
          <div>{{ schedule.group }}</div>
          <div class="text-xs">{{ schedule.modified.toLocaleDateString() }}</div>
        </BaseButton>
      </div>
      <div v-else>Расписания не найдены</div>
    </div>
    <div v-else>
      <BaseProgressBar :percentage="createdPercentage" />
      <div class="mb-5">{{ statusMessage }}</div>
      <BaseButton v-if="currentStatus === Status.Success" class="px-4 py-1.5" @click="currentStatus = Status.Init">
        Вернуться ко всем расписаниям
      </BaseButton>
    </div>
  </div>
</template>
