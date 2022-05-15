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

export enum StatusMessage {
  Pending = "Загрузка расписания",
  Success = "Расписание успешно загружено",
  Error = "Ошибка загрузки расписания",
}

export interface CalendarContext {
  createdCount: Ref<number>;
  parsedCount: Ref<number>;
  createSchedule(group: string, events: ScheduleEvent[]): Promise<void>;
}
