import { type CalendarEvent, type Calendar, apiEndpoints } from "@/composables/google/calendarEntities";

export class CalendarError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

interface ErrorBody {
  error: {
    code: number;
    message: string;
  };
}

interface RequestConfig {
  method: "GET" | "POST" | "DELETE" | "PATCH" | "PUT";
  body?: unknown;
  headers?: Headers;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  private async sendRequest(endpoint: string, config: RequestConfig) {
    let delay = 1;
    let error: CalendarError;
    do {
      const response = await fetch(apiEndpoints.calendar + endpoint, {
        method: config.method,
        headers: this.headers,
        body: JSON.stringify(config.body),
      });

      if (response.ok) {
        const body = await response.json();
        return body;
      }

      const body: ErrorBody = await response.json();
      error = new CalendarError(body.error.message, body.error.code);
      if (error.code === 403 || error.code === 429 || error.code >= 500) {
        await sleep((delay + Math.random()) * 1000);
        delay *= 2;
      } else {
        throw error;
      }
    } while (delay <= 16);
    throw error;
  }

  async getCalendars(): Promise<Calendar[]> {
    const body: { items: Calendar[] } = await this.sendRequest("/users/me/calendarList?fields=items(id,summary)", {
      method: "GET",
    });
    return body.items;
  }

  async getCalendar(summary: string): Promise<Calendar | null> {
    const calendars = await this.getCalendars();
    return calendars.find((value) => value.summary === summary) ?? null;
  }

  async createCalendar(summary: string): Promise<Calendar> {
    const body: Calendar = await this.sendRequest("/calendars", {
      method: "POST",
      body: { summary, timeZone: "Europe/Moscow" },
    });
    return body;
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    return this.sendRequest(`/calendars/${calendarId}`, {
      method: "DELETE",
    });
  }

  async createEvent(event: CalendarEvent, calendarId: string): Promise<void> {
    return this.sendRequest(`/calendars/${calendarId}/events`, {
      method: "POST",
      body: event,
    });
  }
}
