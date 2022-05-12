const baseEndpoint = "https://www.googleapis.com";

export const apiEndpoints = {
  base: baseEndpoint,
  calendar: baseEndpoint + "/calendar/v3",
};

export interface CalendarDateTime {
  dateTime: string;
  timeZone?: string;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: CalendarDateTime;
  end: CalendarDateTime;
  recurrence?: string[];
}

export interface Calendar {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  timeZone?: string;
}
