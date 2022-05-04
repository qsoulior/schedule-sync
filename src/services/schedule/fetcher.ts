import type { ScheduleInfo, Schedule } from "@/services/schedule/entities";
import { computed, onMounted, ref, type ComputedRef, type Ref } from "vue";

interface FetcherContext {
  schedulesInfo: Ref<ScheduleInfo[]>;
  filteredSchedulesInfo: ComputedRef<ScheduleInfo[]>;
  searchedGroup: Ref<string>;
  getSchedule(group: string): Promise<Schedule>;
}

export function useScheduleFetcher(): FetcherContext {
  const schedulesInfo = ref<ScheduleInfo[]>([]);

  onMounted(async () => {
    try {
      const response = await fetch("https://schdl.herokuapp.com/api/info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_MANAGER_API_TOKEN}`,
        },
      });
      const responseText = await response.text();
      schedulesInfo.value = JSON.parse(responseText, (key, value) => (key === "modified" ? new Date(value) : value));
      schedulesInfo.value.sort((a, b) => a.group.localeCompare(b.group));
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  });

  const searchedGroup = ref<string>("");
  const filteredSchedulesInfo = computed<ScheduleInfo[]>(() =>
    schedulesInfo.value.filter((schedule) => schedule.group.toLowerCase().includes(searchedGroup.value.toLowerCase()))
  );

  const cachedSchedules = new Map<string, Schedule>();

  async function getSchedule(group: string): Promise<Schedule> {
    const cachedSchedule = cachedSchedules.get(group);
    if (cachedSchedule) {
      return cachedSchedule;
    }

    const response = await fetch(`https://schdl.herokuapp.com/api/schedules?group=${group}&newest=1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_MANAGER_API_TOKEN}`,
      },
    });
    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`${response.statusText} (${errorText})`);
    }
    const responseText = await response.text();
    const schedule: Schedule = JSON.parse(responseText, (key, value) =>
      ["modified", "start", "end"].includes(key) ? new Date(value) : value
    );

    cachedSchedules.set(group, schedule);
    return schedule;
  }

  return {
    schedulesInfo,
    filteredSchedulesInfo,
    searchedGroup,
    getSchedule,
  };
}
