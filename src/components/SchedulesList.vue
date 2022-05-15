<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useGraphCalendar } from "@/composables/graph/calendar";
import { useScheduleFetcher } from "@/composables/schedule/fetcher";
import BaseInput from "@/components/BaseInput.vue";
import BaseButton from "@/components/BaseButton.vue";
import { accountStore, AccountType } from "@/stores/account";
import BaseProgressBar from "@/components/BaseProgressBar.vue";
import IconCalendar from "@/components/icons/IconCalendar.vue";
import { useGoogleCalendar } from "@/composables/google/calendar";
import { StatusMessage } from "@/composables/context";

const { schedulesInfo, filteredSchedulesInfo, searchedGroup, getSchedule } = useScheduleFetcher();

const graphCalendarContext = reactive(useGraphCalendar());
const googleCalendarContext = reactive(useGoogleCalendar());

const context = computed(() =>
  accountStore.selected === AccountType.Graph ? { ...graphCalendarContext } : { ...googleCalendarContext }
);

const createdPercentage = computed(() =>
  context.value.parsedCount === 0 ? 0 : (context.value.createdCount / context.value.parsedCount) * 100
);

const statusMessage = ref<StatusMessage>();

async function resetStatus() {
  statusMessage.value = undefined;
  context.value.parsedCount = 0;
  context.value.createdCount = 0;
}

async function syncSchedule(group: string): Promise<void> {
  try {
    statusMessage.value = StatusMessage.Pending;
    const schedule = await getSchedule(group);
    if (context.value === undefined) return;
    await context.value.createSchedule(group, schedule.events);
    if (context.value.createdCount === context.value.parsedCount) {
      statusMessage.value = StatusMessage.Success;
    } else {
      statusMessage.value = StatusMessage.Error;
    }
  } catch (error) {
    console.log(error);
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
        :disabled="statusMessage !== undefined"
        v-model="searchedGroup"
      />
    </form>
    <div v-if="statusMessage === undefined">
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
      <BaseButton v-if="statusMessage === StatusMessage.Success" class="px-4 py-1.5" @click="resetStatus">
        Вернуться ко всем расписаниям
      </BaseButton>
    </div>
  </div>
</template>
