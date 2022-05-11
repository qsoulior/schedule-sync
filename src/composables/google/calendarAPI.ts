import { type CalendarEvent, type Calendar, apiEndpoints } from "@/composables/google/calendarEntities";

export class CalendarAPI {
  private accessToken: string;
  private headers: Headers;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessToken}`,
    });
  }

  async getCalendars(): Promise<Calendar[]> {
    const response = await fetch(apiEndpoints.calendar + `/users/me/calendarList?fields=items(id,summary)`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const result: { items: Calendar[] } = await response.json();
    return result.items;
  }

  async getCalendar(summary: string): Promise<Calendar | null> {
    const calendars = await this.getCalendars();
    return calendars.find((value) => value.summary === summary) ?? null;
  }

  async createCalendar(summary: string): Promise<Calendar> {
    const response = await fetch(apiEndpoints.calendar + `/calendars`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ summary, timeZone: "Europe/Moscow" }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const result: Calendar = await response.json();
    return result;
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    const response = await fetch(apiEndpoints.calendar + `/calendars/${calendarId}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  }

  async createEvent(event: CalendarEvent, calendarId: string): Promise<void> {
    const response = await fetch(apiEndpoints.calendar + `/calendars/${calendarId}/events`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  }
}
