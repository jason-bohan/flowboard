export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  created_at: string;
}

export interface TaskStats {
  todo: number;
  inProgress: number;
  done: number;
}

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: Task['status'];
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  status?: Task['status'];
};
