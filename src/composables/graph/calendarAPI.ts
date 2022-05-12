import {
  apiEndpoints,
  type Calendar,
  type CalendarEvent,
  type CalendarGroup,
} from "@/composables/graph/calendarEntities";
import { API } from "@/composables/api";

export interface BatchRequest {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  dependsOn?: string[];
  headers?: Record<string, string>;
  body?: unknown;
}

export interface BatchResponse {
  id: string;
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
}

export class CalendarError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface ErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export class CalendarAPI extends API {
  protected baseURL = apiEndpoints.base;

  protected async handleError(response: Response) {
    const body: ErrorBody = await response.json();
    const error = new CalendarError(body.error.message, response.status, body.error.code);
    if (error.status === 429 || error.status >= 500) {
      return error;
    } else {
      throw error;
    }
  }

  async batch(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const body: { responses: BatchResponse[] } = await this.sendRequest("/$batch", {
      method: "POST",
      body: { requests: requests },
    });

    return body.responses;
  }

  async getCalendarGroup(name: string): Promise<CalendarGroup | null> {
    const body: { value: CalendarGroup[] } = await this.sendRequest(`/me/calendarGroups?$filter=name eq '${name}'`, {
      method: "GET",
    });

    if (body.value.length > 0) {
      return body.value[0];
    }
    return null;
  }

  async createCalendarGroup(name: string): Promise<CalendarGroup> {
    const body: CalendarGroup = await this.sendRequest("/me/calendarGroups", {
      method: "POST",
      body: { name: name },
    });

    return body;
  }

  async getCalendar(name: string, groupId: string): Promise<Calendar | null> {
    const body: { value: Calendar[] } = await this.sendRequest(
      `/me/calendarGroups/${groupId}/calendars?$filter=name eq '${name}'`,
      {
        method: "GET",
      }
    );

    if (body.value.length > 0) {
      return body.value[0];
    }
    return null;
  }

  async createCalendar(name: string, groupId: string): Promise<Calendar> {
    const body: Calendar = await this.sendRequest(`/me/calendarGroups/${groupId}/calendars`, {
      method: "POST",
      body: { name: name },
    });

    return body;
  }

  async deleteCalendar(groupId: string, calendarId: string): Promise<void> {
    return this.sendRequest(`/me/calendarGroups/${groupId}/calendars/${calendarId}`, {
      method: "DELETE",
    });
  }

  async createEvent(event: CalendarEvent, calendarId: string): Promise<void> {
    return this.sendRequest(`/me/calendars/${calendarId}/events`, {
      method: "POST",
      body: event,
    });
  }
}
