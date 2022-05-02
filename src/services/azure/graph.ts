import type { Event as ScheduleEvent } from "@/services/schedule/entities";
import {
  graphConfig,
  type Calendar,
  type CalendarEvent,
  type CalendarEventBody,
  type CalendarGroup,
  type DayOfWeek,
  type GraphLocation,
  type GraphDateTime,
  type CalendarEventRecurrence,
} from "@/services/azure/graphConfig";

export class GraphAPI {
  private accessToken: string;
  private headers: Headers;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessToken}`,
    });
  }

  async getCalendarGroup(name: string): Promise<CalendarGroup | null> {
    const response = await fetch(graphConfig.meEndpoint + `/calendarGroups?$filter=name eq '${name}'`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const result: { value: CalendarGroup[] } = await response.json();
    if (result.value.length > 0) {
      return result.value[0];
    }
    return null;
  }

  async createCalendarGroup(name: string): Promise<CalendarGroup> {
    const response = await fetch(graphConfig.meEndpoint + "/calendarGroups", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ name: name }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const result: CalendarGroup = await response.json();
    return result;
  }

  async getCalendar(name: string, groupId: string): Promise<Calendar | null> {
    const response = await fetch(
      graphConfig.meEndpoint + `/calendarGroups/${groupId}/calendars?$filter=name eq '${name}'`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const result: { value: Calendar[] } = await response.json();
    if (result.value.length > 0) {
      return result.value[0];
    }
    return null;
  }

  async createCalendar(name: string, groupId: string): Promise<Calendar> {
    const response = await fetch(graphConfig.meEndpoint + `/calendarGroups/${groupId}/calendars`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ name: name }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const result: Calendar = await response.json();
    return result;
  }

  async createEvent(event: CalendarEvent, calendarId: string): Promise<void> {
    const response = await fetch(graphConfig.meEndpoint + `/calendars/${calendarId}/events`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  }
}

const daysOfWeek: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export async function parseEvent(scheduleEvent: ScheduleEvent): Promise<CalendarEvent[]> {
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
