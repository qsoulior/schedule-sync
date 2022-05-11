interface ScheduleEventDate {
  start: Date;
  end: Date;
  frequency: "once" | "every" | "throughout";
}

export interface ScheduleEvent {
  title: string;
  teacher: string;
  type: string;
  subgroup: string;
  location: string;
  dates: ScheduleEventDate[];
}

export interface Schedule {
  modified: Date;
  events: ScheduleEvent[];
}

export interface ScheduleInfo {
  group: string;
  modified: Date;
}
