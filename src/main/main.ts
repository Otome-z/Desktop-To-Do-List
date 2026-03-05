import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  Notification,
  nativeImage
} from "electron";
import path from "path";
import { TaskRecord, TrayAction } from "../shared/types";

const isDev = process.env.NODE_ENV !== "production";
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let scheduler: ReminderScheduler | null = null;

class ReminderScheduler {
  private tasks = new Map<string, TaskRecord>();
  private timers = new Map<string, NodeJS.Timeout>();

  sync(records: TaskRecord[]) {
    this.tasks.clear();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    records.forEach((task) => {
      this.tasks.set(task.id, task);
      this.schedule(task);
    });
  }

  private schedule(task: TaskRecord) {
    if (task.completed) {
      return;
    }

    const remaining = task.remindAt - Date.now();
    if (remaining <= 0) {
      this.triggerReminder(task.id);
      return;
    }

    const timer = setTimeout(() => this.triggerReminder(task.id), remaining);
    this.timers.set(task.id, timer);
  }

  private triggerReminder(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task || task.completed) {
      return;
    }

    this.timers.delete(taskId);

    const notification = new Notification({
      title: `提醒：${task.title}`,
      body: task.description || "点击查看详情",
      silent: false
    });

    notification.once("click", () => {
      mainWindow?.webContents.send("notification-click", taskId);
    });

    notification.show();
    mainWindow?.webContents.send("reminder-fired", task);
  }

  markComplete(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    task.completed = true;
    this.tasks.set(task.id, task);
    this.timers.get(taskId) && clearTimeout(this.timers.get(taskId)!);
    this.timers.delete(taskId);
  }

  snooze(taskId: string, minutes: number) {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    task.remindAt = Date.now() + minutes * 60 * 1000;
    this.tasks.set(taskId, { ...task });
    this.schedule(task);
  }
}

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 780,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const rendererUrl = isDev
    ? "http://localhost:5173"
    : new URL("../renderer/index.html", import.meta.url).toString();

  window.loadURL(rendererUrl);
  window.once("ready-to-show", () => window.show());

  window.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      window.hide();
    }
  });

  return window;
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
  );
  tray = new Tray(icon);
  tray.setToolTip("代表事项桌面工具");
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) {
    return;
  }

  const menu = Menu.buildFromTemplate([
    {
      label: "打开主窗口",
      click: () => restoreWindow()
    },
    {
      label: "新建任务",
      click: () => mainWindow?.webContents.send("tray-action", "create")
    },
    {
      label: "退出",
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(menu);
  tray.on("double-click", () => restoreWindow());
}

function restoreWindow() {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }

  mainWindow.show();
  mainWindow.focus();
}

function setAutoLaunch() {
  if (process.platform === "win32") {
    app.setLoginItemSettings({
      openAtLogin: true
    });
  }
}

app.on("ready", () => {
  mainWindow = createMainWindow();
  createTray();
  scheduler = new ReminderScheduler();
  setAutoLaunch();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
  }
});

ipcMain.on("tasks/sync", (_, records: TaskRecord[]) => {
  scheduler?.sync(records);
});

ipcMain.on("reminder/complete", (_, taskId: string) => {
  scheduler?.markComplete(taskId);
});

ipcMain.on("reminder/snooze", (_, taskId: string, minutes: number = 5) => {
  scheduler?.snooze(taskId, minutes);
});

ipcMain.on("tray/action", (_, action: TrayAction) => {
  switch (action) {
    case "open":
      restoreWindow();
      break;
    case "create":
      mainWindow?.webContents.send("tray-action", "create");
      break;
    case "quit":
      app.isQuitting = true;
      app.quit();
      break;
  }
});

app.on("before-quit", () => {
  scheduler = null;
});
