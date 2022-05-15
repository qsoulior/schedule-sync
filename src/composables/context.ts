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
  Parsing = "Подготовка расписания",
  Creating = "Загрузка расписания",
  Success = "Расписание успешно загружено",
  Error = "Ошибка загрузки расписания",
}

export interface CalendarContext {
  statusMessage: Ref<StatusMessage | undefined>;
  createdCount: Ref<number>;
  parsedCount: Ref<number>;
  createSchedule(group: string, events: ScheduleEvent[]): Promise<void>;
  resetStatus(): Promise<void>;
}
