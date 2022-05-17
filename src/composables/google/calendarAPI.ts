import { type CalendarEvent, type Calendar, apiEndpoints } from "@/composables/google/calendarEntities";
import { API, ApiError } from "@/composables/api";

export class CalendarError extends ApiError {
  constructor(message: string, code: number, status: string) {
    super(message, code, status);
    this.name = "GoogleCalendarError";
  }
}

interface ErrorBody {
  error: {
    code: number;
    message: string;
    errors: [
      {
        domain: string;
        reason: string;
      }
    ];
  };
}

export class CalendarAPI extends API {
  protected baseURL = apiEndpoints.calendar;

  protected async handleError(response: Response) {
    const body: ErrorBody = await response.json();
    const error = new CalendarError(body.error.message, body.error.code, body.error.errors[0].reason);
    if (error.code === 408 || error.code === 429 || error.code >= 500) {
      return error;
    } else {
      throw error;
    }
  }

  async getCalendars(): Promise<Calendar[]> {
    const result = await this.sendRequest<{ items: Calendar[] }>("/users/me/calendarList?fields=items(id,summary)", {
      method: "GET",
    });
    return result.body.items;
  }

  async getCalendar(summary: string): Promise<Calendar | null> {
    const calendars = await this.getCalendars();
    return calendars.find((value) => value.summary === summary) ?? null;
  }

  async createCalendar(summary: string): Promise<Calendar> {
    const result = await this.sendRequest<Calendar>("/calendars", {
      method: "POST",
      body: { summary, timeZone: "Europe/Moscow" },
    });
    return result.body;
  }

  async deleteCalendar(calendarId: string) {
    return this.sendRequest(`/calendars/${calendarId}`, {
      method: "DELETE",
    });
  }

  async createEvent(event: CalendarEvent, calendarId: string) {
    return this.sendRequest(`/calendars/${calendarId}/events`, {
      method: "POST",
      body: event,
    });
  }
}
