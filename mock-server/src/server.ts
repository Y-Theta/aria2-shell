import express from 'express';
import cors from 'cors';
import { mockTasks, mockStats, mockConfig } from './data.js';
import type { Task, Config, Stats, ApiResponse } from './types.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (simulating server storage)
let tasks = JSON.parse(JSON.stringify(mockTasks)) as Task[];
let stats = JSON.parse(JSON.stringify(mockStats)) as Stats;
let config = JSON.parse(JSON.stringify(mockConfig)) as Config;

// Helper to send responses
const respond = <T,>(data: T, success = true): ApiResponse<T> => ({
  success,
  data,
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
  res.json(respond(tasks));
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  res.json(respond(task));
});

app.post('/api/tasks', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL required' });
  }

  const newTask: Task = {
    id: Date.now().toString(),
    filename: new URL(url).pathname.split('/').pop() || 'download',
    status: 'downloading',
    progress: 0,
    totalSize: 0,
    completedSize: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: null,
  };

  tasks.push(newTask);
  res.status(201).json(respond(newTask));
});

app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  // Update task properties
  Object.assign(task, req.body);
  res.json(respond(task));
});

app.delete('/api/tasks/:id', (req, res) => {
  tasks = tasks.filter((t) => t.id !== req.params.id);
  res.json(respond({ success: true }));
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json(respond(stats));
});

// Config endpoints
app.get('/api/config', (req, res) => {
  res.json(respond(config));
});

app.put('/api/config', (req, res) => {
  Object.assign(config, req.body);
  res.json(respond(config));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log(`Tasks: ${tasks.length}`);
});
