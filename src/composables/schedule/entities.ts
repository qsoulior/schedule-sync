interface EventDate {
  start: Date;
  end: Date;
  frequency: "once" | "every" | "throughout";
}

export interface Event {
  title: string;
  teacher: string;
  type: string;
  subgroup: string;
  location: string;
  dates: EventDate[];
}

export interface Schedule {
  modified: Date;
  events: Event[];
}

export interface ScheduleInfo {
  group: string;
  modified: Date;
}
