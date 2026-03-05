import { TaskRecord, TrayAction } from "shared/types";

declare global {
  interface Window {
    electronAPI?: {
      syncTasks: (tasks: TaskRecord[]) => void;
      notifyComplete: (taskId: string) => void;
      notifySnooze: (taskId: string, minutes?: number) => void;
      requestTrayAction: (action: TrayAction) => void;
      onReminder: (callback: (task: TaskRecord) => void): void;
      onNotificationClick: (callback: (taskId: string) => void): void;
      onTrayAction: (callback: (action: TrayAction) => void): void;
    };
  }
}

export {};
