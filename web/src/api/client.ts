import axios, { AxiosInstance } from 'axios';
import type { Task, Config, Stats, ApiResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await this.client.get<ApiResponse<Task[]>>('/tasks');
    return response.data.data || [];
  }

  async getTaskById(id: string): Promise<Task> {
    const response = await this.client.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data!;
  }

  async createTask(url: string): Promise<Task> {
    const response = await this.client.post<ApiResponse<Task>>('/tasks', { url });
    return response.data.data!;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await this.client.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
    return response.data.data!;
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete(`/tasks/${id}`);
  }

  async pauseTask(id: string): Promise<void> {
    await this.client.put(`/tasks/${id}`, { status: 'paused' });
  }

  async resumeTask(id: string): Promise<void> {
    await this.client.put(`/tasks/${id}`, { status: 'downloading' });
  }

  // Stats
  async getStats(): Promise<Stats> {
    const response = await this.client.get<ApiResponse<Stats>>('/stats');
    return response.data.data!;
  }

  // Config
  async getConfig(): Promise<Config> {
    const response = await this.client.get<ApiResponse<Config>>('/config');
    return response.data.data!;
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    const response = await this.client.put<ApiResponse<Config>>('/config', config);
    return response.data.data!;
  }
}

export default new ApiClient();
