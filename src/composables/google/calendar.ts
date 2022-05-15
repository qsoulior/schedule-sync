import { ref, computed } from "vue";
import type { ScheduleEvent } from "@/composables/schedule/entities";
import { CalendarAPI } from "@/composables/google/calendarAPI";
import type { CalendarEvent, CalendarDateTime, Calendar } from "@/composables/google/calendarEntities";
import type { CalendarContext } from "@/composables/context";
import { useGoogleToken } from "@/composables/google/auth";

async function parseEvent(scheduleEvent: ScheduleEvent): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];

  const summary = `${scheduleEvent.title} — ${
    scheduleEvent.type === "lecture"
      ? "Лекция"
      : scheduleEvent.type === "seminar"
      ? "Семинар"
      : `Лабораторная работа (${scheduleEvent.subgroup})`
  }`;

  let start: CalendarDateTime, end: CalendarDateTime, recurrence: string[] | undefined;

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
      const untilString = date.end.toISOString().slice(0, 19).split(/-|:/).join("") + "Z";
      recurrence = [`RRULE:FREQ=WEEKLY;INTERVAL=${date.frequency === "every" ? 1 : 2};UNTIL=${untilString}`];
    }
    events.push({
      summary,
      description: scheduleEvent.teacher,
      location: scheduleEvent.location,
      start,
      end,
      recurrence,
    });
  }

  return events;
}

export function useGoogleCalendar(): CalendarContext {
  const { accessToken, acquireToken } = useGoogleToken();

  const calendarAPI = computed<CalendarAPI | null>(() =>
    accessToken.value ? new CalendarAPI(accessToken.value) : null
  );
  const tokenError = new Error("accessToken is null");

  async function createCalendar(name: string): Promise<Calendar> {
    if (calendarAPI.value === null) throw tokenError;
    let calendar: Calendar | null;
    calendar = await calendarAPI.value.getCalendar(name);
    if (calendar === null) {
      calendar = await calendarAPI.value.createCalendar(name);
    }
    return calendar;
  }

  const parsedCount = ref<number>(0);
  const createdCount = ref<number>(0);

  async function createEvents(events: CalendarEvent[], calendarId: string): Promise<void> {
    if (calendarAPI.value === null) throw tokenError;
    for (const event of events) {
      await calendarAPI.value.createEvent(event, calendarId);
      createdCount.value++;
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

    const calendar = await createCalendar(group);
    await createEvents(calendarEvents, calendar.id);
  }

  return {
    createdCount,
    parsedCount,
    createSchedule,
  };
}
