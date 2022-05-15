import { computed, ref } from "vue";
import type { ScheduleEvent } from "@/composables/schedule/entities";
import type {
  Calendar,
  CalendarEvent,
  CalendarEventBody,
  DayOfWeek,
  GraphLocation,
  GraphDateTime,
  CalendarEventRecurrence,
} from "@/composables/graph/calendarEntities";
import { CalendarAPI, type BatchRequest } from "@/composables/graph/calendarAPI";
import { useGraphToken } from "@/composables/graph/auth";
import type { CalendarContext } from "@/composables/context";

const daysOfWeek: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

async function parseEvent(scheduleEvent: ScheduleEvent): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];

  const subject = `${scheduleEvent.title} — ${
    scheduleEvent.type === "lecture"
      ? "Лекция"
      : scheduleEvent.type === "seminar"
      ? "Семинар"
      : `Лабораторная работа (${scheduleEvent.subgroup})`
  }`;
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

export function useGraphCalendar(): CalendarContext {
  const { accessToken, acquireToken } = useGraphToken();

  const graphAPI = computed<CalendarAPI | null>(() => (accessToken.value ? new CalendarAPI(accessToken.value) : null));
  const tokenError = new Error("accessToken is null");

  async function createCalendar(name: string, groupName: string): Promise<Calendar> {
    if (graphAPI.value === null) throw tokenError;
    let calendarGroup = await graphAPI.value.getCalendarGroup(groupName);
    let calendar: Calendar | null;
    if (calendarGroup === null) {
      calendarGroup = await graphAPI.value.createCalendarGroup(groupName);
      calendar = await graphAPI.value.createCalendar(name, calendarGroup.id);
      return calendar;
    }
    calendar = await graphAPI.value.getCalendar(name, calendarGroup.id);
    if (calendar === null) {
      calendar = await graphAPI.value.createCalendar(name, calendarGroup.id);
    }
    return calendar;
  }

  const parsedCount = ref<number>(0);
  const createdCount = ref<number>(0);

  async function createEvents(events: CalendarEvent[], calendarId: string): Promise<void> {
    if (graphAPI.value === null) throw tokenError;
    const requests: BatchRequest[] = [];
    for (const [i, event] of events.entries()) {
      requests.push({
        id: requests.length.toString(),
        method: "POST",
        url: `/me/calendars/${calendarId}/events`,
        body: event,
        headers: { "Content-Type": "application/json" },
      });
      if (requests.length === 4 || i === events.length - 1) {
        const responses = await graphAPI.value.batch(requests);
        requests.length = 0;
        for (const response of responses) {
          if (response.status === 201) createdCount.value++;
        }
      }
    }
  }

  async function createSchedule(group: string, events: ScheduleEvent[]): Promise<void> {
    await acquireToken();
    if (accessToken.value === undefined) return;

    const calendarEvents: CalendarEvent[] = [];
    for (const event of events) {
      const calendarEventsPart = await parseEvent(event);
      calendarEvents.push(...calendarEventsPart);
    }
    parsedCount.value = calendarEvents.length;

    const calendar = await createCalendar(group, "Расписания");
    await createEvents(calendarEvents, calendar.id);
  }

  return {
    createdCount,
    parsedCount,
    createSchedule,
  };
}
