import { useState, useEffect } from 'react';
import { Task } from '../models/types';
import { TaskController } from '../controllers/TaskController';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const controller = new TaskController();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await controller.getAllTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await controller.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const verifySubmission = async (
    taskId: number,
    submissionId: number,
    action: 'approve' | 'reject' | 'resubmit'
  ) => {
    try {
      await controller.verifySubmission(taskId, submissionId, action);
      // Update the task submission status in the list
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? {
                ...task,
                submissions: task.submissions.map(sub =>
                  sub.id === submissionId
                    ? { ...sub, status: action === 'resubmit' ? 'pending' : action }
                    : sub
                ),
              }
            : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify submission');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    verifySubmission,
  };
}