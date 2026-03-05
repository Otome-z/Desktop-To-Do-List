export interface TaskRecord {
  id: string;
  title: string;
  description?: string;
  remindAt: number;
  completed: boolean;
}

export type TrayAction = 'open' | 'create' | 'quit';
