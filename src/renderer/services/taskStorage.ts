import { openDB } from "idb";
import { TaskRecord } from "shared/types";

const DB_NAME = "representative-tasks";
const STORE_NAME = "tasks";

let dbPromise: ReturnType<typeof openDB> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      }
    });
  }

  return dbPromise;
}

function createId() {
  return (globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`) as string;
}

function ensureTask(task: Partial<TaskRecord>): TaskRecord {
  return {
    id: task.id ?? createId(),
    title: task.title ?? "新任务",
    description: task.description ?? "",
    remindAt: task.remindAt ?? Date.now() + 5 * 60 * 1000,
    completed: task.completed ?? false
  };
}

export async function getAllTasks(): Promise<TaskRecord[]> {
  const db = await getDb();
  return await db.getAll(STORE_NAME);
}

export async function saveTask(task: Partial<TaskRecord>): Promise<TaskRecord> {
  const db = await getDb();
  const ready = ensureTask(task);
  await db.put(STORE_NAME, ready);
  return ready;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}
