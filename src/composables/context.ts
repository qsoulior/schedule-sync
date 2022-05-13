import type { Ref } from "vue";
import type { ScheduleEvent } from "@/composables/schedule/entities";

export interface AuthContext {
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export interface TokenContext {
  accessToken: Ref<string | undefined>;
  acquireToken(): Promise<void>;
}

export interface CalendarContext {
  statusMessage: Ref<string>;
  createdCount: Ref<number>;
  createdPercentage: Ref<number>;
  createSchedule(group: string, events: ScheduleEvent[]): Promise<void>;
}
