import { ref, computed, type Ref } from "vue";
import type { ScheduleEvent } from "@/composables/schedule/entities";
import { CalendarAPI } from "@/composables/google/calendarAPI";
import type { CalendarEvent, CalendarDateTime, Calendar } from "@/composables/google/calendarEntities";

async function parseEvent(scheduleEvent: ScheduleEvent): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];

  const summary = `${scheduleEvent.title} (${
    scheduleEvent.type === "lecture" ? "Лекция" : scheduleEvent.type === "seminar" ? "Семинар" : "Лабораторная работа"
  })`;

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

interface CalendarContext {
  statusMessageGoogle: Ref<string>;
  createdCountGoogle: Ref<number>;
  createdPercentageGoogle: Ref<number>;
  createScheduleGoogle(group: string, events: ScheduleEvent[]): Promise<void>;
}

export function useGoogleCalendar(accessToken: Ref<string | undefined>): CalendarContext {
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

  const statusMessage = ref<string>("");
  const parsedCount = ref<number>(0);
  const createdCount = ref<number>(0);
  const createdPercentage = computed<number>(() =>
    parsedCount.value === 0 ? 0 : (createdCount.value / parsedCount.value) * 100
  );

  async function createEvents(events: CalendarEvent[], calendarId: string): Promise<void> {
    if (calendarAPI.value === null) throw tokenError;
    for (const event of events) {
      await calendarAPI.value.createEvent(event, calendarId);
      createdCount.value++;
    }
  }

  async function createSchedule(group: string, events: ScheduleEvent[]): Promise<void> {
    parsedCount.value = 0;
    createdCount.value = 0;
    if (calendarAPI.value === null) throw tokenError;
    statusMessage.value = "Создание календаря";
    const calendar = await createCalendar(group);
    const calendarEvents: CalendarEvent[] = [];
    statusMessage.value = "Подготовка расписания";
    for (const event of events) {
      const calendarEventsPart = await parseEvent(event);
      calendarEvents.push(...calendarEventsPart);
    }
    parsedCount.value = calendarEvents.length;
    statusMessage.value = "Загрузка расписания";
    await createEvents(calendarEvents, calendar.id);
    if (createdCount.value === parsedCount.value) {
      statusMessage.value = "Расписание загружено";
    } else {
      statusMessage.value = "Ошибка загрузки расписания";
    }
  }

  return {
    statusMessageGoogle: statusMessage,
    createdCountGoogle: createdCount,
    createdPercentageGoogle: createdPercentage,
    createScheduleGoogle: createSchedule,
  };
}
