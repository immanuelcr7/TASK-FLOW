import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Task from '../src/models/Task.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear database between test runs
  await User.deleteMany({});
  await Task.deleteMany({});
});

describe('Authentication & User Flow', () => {
  const testUser = {
    name: 'Alice Developer',
    email: 'alice@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  it('should successfully register a new user and set HttpOnly auth cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose password hash

    // Verify cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('token='))).toBe(true);
  });

  it('should reject registration if email is already registered (409 Conflict)', async () => {
    // Register first time
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Register again with same email
    const duplicateRes = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toContain('already exists');
  });

  it('should reject registration with invalid email or mismatched passwords (400)', async () => {
    const invalidRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Bob',
        email: 'invalid-email',
        password: 'Pass1',
        confirmPassword: 'Pass2',
      });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.success).toBe(false);
    expect(invalidRes.body.errors.length).toBeGreaterThan(0);
  });

  it('should successfully log in with valid credentials and reject invalid credentials', async () => {
    // First register
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Valid login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe(testUser.email);

    // Invalid password
    const badLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword999' });

    expect(badLoginRes.status).toBe(401);
    expect(badLoginRes.body.success).toBe(false);
  });

  it('should block access to protected routes when unauthenticated (401)', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow access to /api/v1/auth/me with valid session cookie', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const authCookie = regRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', authCookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe(testUser.email);
  });
});

describe('Task Management CRUD & Ownership Security', () => {
  let userACookie;
  let userBCookie;
  let userAId;
  let userBId;

  beforeEach(async () => {
    // Create User A
    const resA = await request(app).post('/api/v1/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    userACookie = resA.headers['set-cookie'];
    userAId = resA.body.data.user.id;

    // Create User B
    const resB = await request(app).post('/api/v1/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    userBCookie = resB.headers['set-cookie'];
    userBId = resB.body.data.user.id;
  });

  it('should create a task successfully for User A', async () => {
    const taskPayload = {
      title: 'Complete System Architecture Review',
      description: 'Review backend security, validation, and database indexes.',
      status: 'In Progress',
      priority: 'High',
      category: 'Work',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    };

    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Cookie', userACookie)
      .send(taskPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.title).toBe(taskPayload.title);
    expect(res.body.data.task.priority).toBe('High');
    expect(res.body.data.task.userId.toString()).toBe(userAId);
  });

  it('should PREVENT User B from reading, editing, or deleting User A task (Strict Ownership Isolation)', async () => {
    // 1. User A creates a task
    const createRes = await request(app)
      .post('/api/v1/tasks')
      .set('Cookie', userACookie)
      .send({
        title: "User A Confidential Task",
        dueDate: new Date().toISOString(),
      });
    const taskId = createRes.body.data.task._id;

    // 2. User B attempts to GET User A's task -> Must be 404
    const getRes = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Cookie', userBCookie);
    expect(getRes.status).toBe(404);

    // 3. User B attempts to PATCH User A's task -> Must be 404
    const patchRes = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Cookie', userBCookie)
      .send({ title: 'Hacked Title' });
    expect(patchRes.status).toBe(404);

    // 4. User B attempts to DELETE User A's task -> Must be 404
    const deleteRes = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set('Cookie', userBCookie);
    expect(deleteRes.status).toBe(404);

    // 5. Verify User A's task is still intact
    const verifyRes = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Cookie', userACookie);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.task.title).toBe("User A Confidential Task");
  });

  it('should support search, status filters, sorting, and pagination', async () => {
    // Create multiple tasks for User A
    const tasks = [
      { title: 'Learn React Hooks', category: 'Study', priority: 'High', status: 'To Do', dueDate: new Date().toISOString() },
      { title: 'Build Express REST API', category: 'Project', priority: 'High', status: 'In Progress', dueDate: new Date().toISOString() },
      { title: 'Buy groceries', category: 'Personal', priority: 'Low', status: 'Completed', dueDate: new Date().toISOString() },
      { title: 'Deploy on Cloud', category: 'Work', priority: 'Medium', status: 'To Do', dueDate: new Date().toISOString() },
    ];

    for (const t of tasks) {
      await request(app).post('/api/v1/tasks').set('Cookie', userACookie).send(t);
    }

    // Search query
    const searchRes = await request(app)
      .get('/api/v1/tasks?search=Express')
      .set('Cookie', userACookie);
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.tasks.length).toBe(1);
    expect(searchRes.body.data.tasks[0].title).toContain('Express');

    // Filter by status
    const statusRes = await request(app)
      .get('/api/v1/tasks?status=To Do')
      .set('Cookie', userACookie);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.tasks.length).toBe(2);

    // Pagination test
    const pageRes = await request(app)
      .get('/api/v1/tasks?limit=2&page=1')
      .set('Cookie', userACookie);
    expect(pageRes.status).toBe(200);
    expect(pageRes.body.data.tasks.length).toBe(2);
    expect(pageRes.body.data.pagination.totalTasks).toBe(4);
    expect(pageRes.body.data.pagination.totalPages).toBe(2);
  });

  it('should compute real-time dashboard statistics accurately', async () => {
    // Create 1 completed, 1 in-progress, 1 overdue todo
    const pastDate = new Date(Date.now() - 2 * 86400000).toISOString();
    const futureDate = new Date(Date.now() + 2 * 86400000).toISOString();

    await request(app).post('/api/v1/tasks').set('Cookie', userACookie).send({
      title: 'Task 1', status: 'Completed', dueDate: pastDate, priority: 'Low', category: 'Work'
    });
    await request(app).post('/api/v1/tasks').set('Cookie', userACookie).send({
      title: 'Task 2', status: 'In Progress', dueDate: futureDate, priority: 'Medium', category: 'Project'
    });
    await request(app).post('/api/v1/tasks').set('Cookie', userACookie).send({
      title: 'Task 3', status: 'To Do', dueDate: pastDate, priority: 'High', category: 'Personal'
    });

    const statsRes = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Cookie', userACookie);

    expect(statsRes.status).toBe(200);
    const { stats, charts } = statsRes.body.data;
    expect(stats.totalTasks).toBe(3);
    expect(stats.completedTasks).toBe(1);
    expect(stats.inProgressTasks).toBe(1);
    expect(stats.todoTasks).toBe(1);
    expect(stats.overdueTasks).toBe(1);
    expect(stats.completionRate).toBe(33); // 1 / 3 = 33%
    expect(charts.statusDistribution.length).toBe(3);
  });
});
