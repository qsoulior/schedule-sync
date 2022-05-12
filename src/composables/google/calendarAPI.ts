import { type CalendarEvent, type Calendar, apiEndpoints } from "@/composables/google/calendarEntities";
import { API } from "@/composables/api";

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

export class CalendarAPI extends API {
  protected baseURL = apiEndpoints.calendar;

  protected async handleError(response: Response) {
    const body: ErrorBody = await response.json();
    const error = new CalendarError(body.error.message, body.error.code);
    if (error.code === 403 || error.code === 408 || error.code === 429 || error.code >= 500) {
      return error;
    } else {
      throw error;
    }
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
