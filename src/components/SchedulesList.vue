<script setup lang="ts">
import { computed, ref } from "vue";
import { useAzureToken } from "@/composables/azure/auth";
import { useGoogleToken } from "@/composables/google/auth";
import { useAzureGraph } from "@/composables/azure/graph";
import { useScheduleFetcher } from "@/composables/schedule/fetcher";
import BaseInput from "@/components/BaseInput.vue";
import BaseButton from "@/components/BaseButton.vue";
import { accountStore, AccountType } from "@/stores/account";
import BaseProgressBar from "@/components/BaseProgressBar.vue";
import IconCalendar from "@/components/icons/IconCalendar.vue";
import { useGoogleCalendar } from "@/composables/google/calendar";

const { schedulesInfo, filteredSchedulesInfo, searchedGroup, getSchedule } = useScheduleFetcher();
const { accessTokenAzure, acquireTokenAzure } = useAzureToken();
const { accessTokenGoogle, acquireTokenGoogle } = useGoogleToken();
const { statusMessageAzure, createdPercentageAzure, createScheduleAzure } = useAzureGraph(accessTokenAzure);
const { statusMessageGoogle, createdPercentageGoogle, createScheduleGoogle } = useGoogleCalendar(accessTokenGoogle);

enum Status {
  Init,
  Pending,
  Success,
  Error,
}

const currentStatus = ref<Status>(Status.Init);

const createdPercentage = computed(() =>
  accountStore.selected === AccountType.Azure
    ? createdPercentageAzure.value
    : accountStore.selected === AccountType.Google
    ? createdPercentageGoogle.value
    : undefined
);

const statusMessage = computed(() =>
  accountStore.selected === AccountType.Azure
    ? statusMessageAzure.value
    : accountStore.selected === AccountType.Google
    ? statusMessageGoogle.value
    : ""
);

async function syncSchedule(group: string): Promise<void> {
  currentStatus.value = Status.Pending;
  try {
    const schedule = await getSchedule(group);
    if (accountStore.selected === AccountType.Azure) {
      await acquireTokenAzure();
      await createScheduleAzure(group, schedule.events);
    } else if (accountStore.selected === AccountType.Google) {
      await acquireTokenGoogle();
      await createScheduleGoogle(group, schedule.events);
    } else {
      return;
    }
    if (createdPercentage.value === 100) {
      currentStatus.value = Status.Success;
    } else {
      currentStatus.value = Status.Error;
    }
  } catch (error) {
    console.log(error);
    currentStatus.value = Status.Error;
  }
}
</script>

<template>
  <div class="w-[46rem] rounded border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-800/25 bg-zinc-50/25 p-5">
    <div class="mb-5 flex flex-row items-center gap-1.5">
      <IconCalendar class="h-5 w-5 dark:stroke-sky-300 stroke-sky-400" />
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
