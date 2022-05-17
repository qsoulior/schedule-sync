import {
  apiEndpoints,
  type Calendar,
  type CalendarEvent,
  type CalendarGroup,
} from "@/composables/graph/calendarEntities";
import { API, ApiError, type ResponseResult } from "@/composables/api";

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

export class CalendarError extends ApiError {
  constructor(message: string, code: number, status: string) {
    super(message, code, status);
    this.name = "GraphCalendarError";
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
    if (error.code === 429 || error.code >= 500) {
      return error;
    } else {
      throw error;
    }
  }

  async batch(requests: BatchRequest[]): Promise<ResponseResult<unknown>[]> {
    const result = await this.sendRequest<{ responses: BatchResponse[] }>("/$batch", {
      method: "POST",
      body: { requests: requests },
    });

    const results: ResponseResult<unknown>[] = [];
    const errors: string[] = [];

    for (const response of result.body.responses) {
      if (response.status === 429 || response.status >= 500) {
        errors.push(response.id);
      } else {
        results.push({
          status: response.status,
          body: response.body,
          headers: response.headers,
        });
      }
    }

    for (const request of requests) {
      if (errors.includes(request.id)) {
        try {
          const result = await this.sendRequest<unknown>(this.baseURL + request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body,
          });
          results.push({
            status: result.status,
            headers: result.headers,
            body: result.body,
          });
        } catch (error) {
          if (error instanceof CalendarError) {
            results.push({ status: error.code, body: undefined });
          }
        }
      }
    }

    return results;
  }

  async getCalendarGroup(name: string): Promise<CalendarGroup | null> {
    const result = await this.sendRequest<{ value: CalendarGroup[] }>(`/me/calendarGroups?$filter=name eq '${name}'`, {
      method: "GET",
    });

    if (result.body.value.length > 0) {
      return result.body.value[0];
    }
    return null;
  }

  async createCalendarGroup(name: string): Promise<CalendarGroup> {
    const result = await this.sendRequest<CalendarGroup>("/me/calendarGroups", {
      method: "POST",
      body: { name: name },
    });

    return result.body;
  }

  async getCalendar(name: string, groupId: string): Promise<Calendar | null> {
    const result = await this.sendRequest<{ value: Calendar[] }>(
      `/me/calendarGroups/${groupId}/calendars?$filter=name eq '${name}'`,
      {
        method: "GET",
      }
    );

    if (result.body.value.length > 0) {
      return result.body.value[0];
    }
    return null;
  }

  async createCalendar(name: string, groupId: string): Promise<Calendar> {
    const result = await this.sendRequest<Calendar>(`/me/calendarGroups/${groupId}/calendars`, {
      method: "POST",
      body: { name: name },
    });

    return result.body;
  }

  async deleteCalendar(groupId: string, calendarId: string) {
    return this.sendRequest(`/me/calendarGroups/${groupId}/calendars/${calendarId}`, {
      method: "DELETE",
    });
  }

  async createEvent(event: CalendarEvent, calendarId: string) {
    return this.sendRequest(`/me/calendars/${calendarId}/events`, {
      method: "POST",
      body: event,
    });
  }
}
