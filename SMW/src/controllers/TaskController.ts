import { Task } from '../models/types';
import { TaskService } from '../services/TaskService';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async getAllTasks(): Promise<Task[]> {
    return this.taskService.getAllTasks();
  }

  async getTaskById(id: number): Promise<Task | null> {
    return this.taskService.getTaskById(id);
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    return this.taskService.createTask(taskData);
  }

  async verifySubmission(
    taskId: number,
    submissionId: number,
    action: 'approve' | 'reject' | 'resubmit'
  ): Promise<void> {
    return this.taskService.verifySubmission(taskId, submissionId, action);
  }
}