import { graphEndpoints, type Calendar, type CalendarEvent, type CalendarGroup } from "@/composables/azure/graphConfig";

export interface BatchRequest {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";
  url: string;
  dependsOn?: string[];
  headers?: HeadersInit;
  body?: unknown;
}

export interface BatchResponse {
  id: string;
  status: number;
  headers?: HeadersInit;
  body?: unknown;
}

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

  async batch(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const response = await fetch(graphEndpoints.base + `/$batch`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ requests }),
    });
    if (!response.ok) throw new Error(response.status.toString());
    const result: { responses: BatchResponse[] } = await response.json();
    return result.responses;
  }

  async getCalendarGroup(name: string): Promise<CalendarGroup | null> {
    const response = await fetch(graphEndpoints.me + `/calendarGroups?$filter=name eq '${name}'`, {
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
    const response = await fetch(graphEndpoints.me + "/calendarGroups", {
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
    const response = await fetch(graphEndpoints.me + `/calendarGroups/${groupId}/calendars?$filter=name eq '${name}'`, {
      method: "GET",
      headers: this.headers,
    });

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
    const response = await fetch(graphEndpoints.me + `/calendarGroups/${groupId}/calendars`, {
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
    const response = await fetch(graphEndpoints.me + `/calendars/${calendarId}/events`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  }
}
