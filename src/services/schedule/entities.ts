interface EventTime {
  start: string;
  end: string;
}

interface EventDate {
  start: string;
  end: string;
  frequency: string;
}

interface Event {
  title: string;
  teacher: string;
  type: string;
  subgroup: string;
  location: string;
  time: EventTime;
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
