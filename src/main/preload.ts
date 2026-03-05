import { contextBridge, ipcRenderer } from "electron";
import { TaskRecord, TrayAction } from "../shared/types";

contextBridge.exposeInMainWorld("electronAPI", {
  syncTasks: (tasks: TaskRecord[]) => ipcRenderer.send("tasks/sync", tasks),
  notifyComplete: (taskId: string) => ipcRenderer.send("reminder/complete", taskId),
  notifySnooze: (taskId: string, minutes = 5) =>
    ipcRenderer.send("reminder/snooze", taskId, minutes),
  requestTrayAction: (action: TrayAction) => ipcRenderer.send("tray/action", action),
  onReminder: (callback: (task: TaskRecord) => void) =>
    ipcRenderer.on("reminder-fired", (_, task) => callback(task)),
  onNotificationClick: (callback: (taskId: string) => void) =>
    ipcRenderer.on("notification-click", (_, taskId) => callback(taskId)),
  onTrayAction: (callback: (action: TrayAction) => void) =>
    ipcRenderer.on("tray-action", (_, action) => callback(action))
});
