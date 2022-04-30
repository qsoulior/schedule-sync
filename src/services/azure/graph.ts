const graphConfig = {
  meEndpoint: "https://graph.microsoft.com/v1.0/me",
};

export interface CalendarGroup {
  id: string;
  classId: string;
  name: string;
  changeKey: string;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  changeKey: string;
  canShare: boolean;
  canViewPrivateItems: boolean;
  hexColor: string;
  canEdit: boolean;
  isTallyingResponses: boolean;
  isRemovable: boolean;
  owner: {
    name: string;
    address: string;
  };
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
}
