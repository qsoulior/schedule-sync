const graphConfig = {
  meEndpoint: "https://graph.microsoft.com/v1.0/me",
};

interface EmailAddress {
  address: string;
  name: string;
}

interface GraphObject {
  id: string;
  changeKey: string;
}

interface GraphDateTime {
  dateTime: string;
  timeZone: string;
}

interface GraphLocation {
  displayName: string;
  locationType: string;
}

export interface CalendarGroup extends GraphObject {
  classId: string;
  name: string;
}

export interface Calendar extends GraphObject {
  name: string;
  color: string;
  hexColor: string;
  canShare: boolean;
  canEdit: boolean;
  isRemovable: boolean;
  owner: EmailAddress;
}

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type RecurrencePatternType =
  | "daily"
  | "weekly"
  | "absoluteMonthly"
  | "relativeMonthly"
  | "absoluteYearly"
  | "relativeYearly";
type WeekIndex = "first" | "second" | "third" | "fourth" | "last";

interface RecurrencePattern {
  type: RecurrencePatternType;
  interval: number;
  firstDayOfWeek: DayOfWeek;
  daysOfWeek: DayOfWeek[];
  dayOfMonth: number;
  index: WeekIndex;
  month: number;
}

type RecurrenceRangeType = "endDate" | "noEnd" | "numbered";

interface RecurrenceRange {
  type: RecurrenceRangeType;
  startDate: string;
  endDate: string;
  recurrenceTimeZone: string;
  numberOfOccurrences: number;
}

export interface Event extends GraphObject {
  subject: string;
  body: {
    contentType: string;
    content: string;
  };
  start: GraphDateTime;
  end: GraphDateTime;
  recurrence: {
    pattern: RecurrencePattern;
    range: RecurrenceRange;
  };
  location: GraphLocation;
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
