import { computed, ref, type Ref } from "vue";
import type { Event as ScheduleEvent } from "@/services/schedule/entities";
import type {
  Calendar,
  CalendarEvent,
  CalendarEventBody,
  DayOfWeek,
  GraphLocation,
  GraphDateTime,
  CalendarEventRecurrence,
} from "@/services/azure/graphConfig";
import { GraphAPI, type BatchRequest } from "@/services/azure/graphAPI";
import { store } from "@/store";

const daysOfWeek: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

async function parseEvent(scheduleEvent: ScheduleEvent): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];

  const subject = `${scheduleEvent.title} (${
    scheduleEvent.type === "lecture" ? "Лекция" : scheduleEvent.type === "seminar" ? "Семинар" : "Лабораторная работа"
  })`;
  const body: CalendarEventBody = {
    contentType: "text",
    content: scheduleEvent.teacher,
  };
  const location: GraphLocation = {
    displayName: scheduleEvent.location,
  };

  let start: GraphDateTime, end: GraphDateTime, recurrence: CalendarEventRecurrence | undefined;
  for (const date of scheduleEvent.dates) {
    start = {
      dateTime: date.start.toISOString().slice(0, 19),
      timeZone: "UTC",
    };
    if (date.frequency === "once") {
      end = {
        dateTime: date.end.toISOString().slice(0, 19),
        timeZone: "UTC",
      };
      recurrence = undefined;
    } else {
      end = {
        dateTime: date.start.toISOString().slice(0, 11) + date.end.toISOString().slice(11, 19),
        timeZone: "UTC",
      };
      recurrence = {
        pattern: {
          type: "weekly",
          interval: date.frequency === "every" ? 1 : 2,
          daysOfWeek: [daysOfWeek[date.start.getDay()]],
        },
        range: {
          type: "endDate",
          startDate: date.start.toISOString().slice(0, 10),
          endDate: date.end.toISOString().slice(0, 10),
        },
      };
    }
    events.push({
      subject,
      body,
      location,
      start,
      end,
      recurrence,
    });
  }

  return events;
}

interface GraphContext {
  status: Ref<string>;
  createdCount: Ref<number>;
  createdPercents: Ref<number>;
  createSchedule(group: string, events: ScheduleEvent[]): Promise<void>;
}

export function useGraph(): GraphContext {
  const graphAPI = computed<GraphAPI | null>(() =>
    store.accessToken !== null ? new GraphAPI(store.accessToken) : null
  );
  const tokenError = new Error("accessToken is null");

  async function createCalendar(name: string): Promise<Calendar> {
    if (graphAPI.value === null) throw tokenError;
    let calendarGroup = await graphAPI.value.getCalendarGroup("schdl");
    let calendar: Calendar | null;
    if (calendarGroup === null) {
      calendarGroup = await graphAPI.value.createCalendarGroup("schdl");
      calendar = await graphAPI.value.createCalendar(name, calendarGroup.id);
      return calendar;
    }
    calendar = await graphAPI.value.getCalendar(name, calendarGroup.id);
    if (calendar === null) {
      calendar = await graphAPI.value.createCalendar(name, calendarGroup.id);
    }
    return calendar;
  }

  const status = ref<string>("");
  const parsedCount = ref<number>(0);
  const createdCount = ref<number>(0);
  const createdPercents = computed<number>(() =>
    parsedCount.value === 0 ? 0 : (createdCount.value / parsedCount.value) * 100
  );

  async function createEvents(events: CalendarEvent[], calendarId: string): Promise<void> {
    if (graphAPI.value === null) throw tokenError;
    const batchRequests: BatchRequest[] = [];
    for (const [i, event] of events.entries()) {
      batchRequests.push({
        id: batchRequests.length.toString(),
        method: "POST",
        url: `/me/calendars/${calendarId}/events`,
        body: event,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (batchRequests.length === 4 || i === events.length - 1) {
        const batchResponses = await graphAPI.value.batch(batchRequests);
        for (const batchResponse of batchResponses) {
          if (batchResponse.status === 201) createdCount.value++;
        }
        batchRequests.length = 0; // empty array
      }
    }
  }

  async function createSchedule(group: string, events: ScheduleEvent[]) {
    parsedCount.value = 0;
    createdCount.value = 0;
    if (graphAPI.value === null) throw tokenError;
    status.value = "Создание календаря";
    const calendar = await createCalendar(group);
    const calendarEvents: CalendarEvent[] = [];
    status.value = "Подготовка расписания";
    for (const event of events) {
      const calendarEventsPart = await parseEvent(event);
      calendarEvents.push(...calendarEventsPart);
    }
    parsedCount.value = calendarEvents.length;
    status.value = "Загрузка расписания";
    await createEvents(calendarEvents, calendar.id);
    console.log(parsedCount.value, createdCount.value);
  }

  return {
    status,
    createdCount,
    createdPercents,
    createSchedule,
  };
}
