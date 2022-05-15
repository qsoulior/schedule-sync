const baseEndpoint = "https://graph.microsoft.com/v1.0";

export const apiEndpoints = {
  base: baseEndpoint,
  me: baseEndpoint + "/me",
};

interface EmailAddress {
  address: string;
  name: string;
}

interface GraphObject {
  id: string;
  changeKey: string;
}

export interface GraphDateTime {
  dateTime: string;
  timeZone: string;
}

export interface GraphLocation {
  displayName: string;
  locationType?: string;
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

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
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
  firstDayOfWeek?: DayOfWeek;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  index?: WeekIndex;
  month?: number;
}

type RecurrenceRangeType = "endDate" | "noEnd" | "numbered";

interface RecurrenceRange {
  type: RecurrenceRangeType;
  startDate: string;
  endDate?: string;
  recurrenceTimeZone?: string;
  numberOfOccurrences?: number;
}

export interface CalendarEventRecurrence {
  pattern: RecurrencePattern;
  range: RecurrenceRange;
}

export interface CalendarEventBody {
  contentType: string;
  content: string;
}

export interface CalendarEvent extends Partial<GraphObject> {
  subject: string;
  body?: CalendarEventBody;
  start: GraphDateTime;
  end: GraphDateTime;
  recurrence?: CalendarEventRecurrence;
  location?: GraphLocation;
}
