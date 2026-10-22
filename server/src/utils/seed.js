import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { connectDB } from '../config/db.js';

const seedDatabase = async () => {
  try {
    console.log('[TaskFlow Seeder] Connecting to database...');
    await connectDB();

    const demoEmail = 'demo@taskflow.dev';
    const demoPassword = 'TaskFlowDemo123!';

    // Remove existing demo user and their tasks
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      await Task.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
      console.log('[TaskFlow Seeder] Cleaned up existing demo data.');
    }

    // Create demo user
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(demoPassword, salt);

    const user = await User.create({
      name: 'Alex Rivera',
      email: demoEmail,
      passwordHash,
    });

    console.log(`[TaskFlow Seeder] Created Demo User: ${user.email} (Password: ${demoPassword})`);

    // Prepare realistic sample tasks
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const today = new Date(now);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sampleTasks = [
      {
        userId: user._id,
        title: 'Review System Architecture & Security Spec',
        description: 'Verify JWT HttpOnly cookie configurations, CORS headers, and MongoDB indexing.',
        status: 'Completed',
        priority: 'High',
        category: 'Work',
        dueDate: twoDaysAgo,
        completedAt: yesterday,
      },
      {
        userId: user._id,
        title: 'Prepare Final Year Project Presentation',
        description: 'Design 10 slides summarizing problem statement, system architecture, and API benchmarks.',
        status: 'In Progress',
        priority: 'High',
        category: 'Study',
        dueDate: today,
      },
      {
        userId: user._id,
        title: 'Submit Cloud Infrastructure Cost Audit',
        description: 'Audit idle dev clusters and implement auto-shutdown schedules.',
        status: 'To Do',
        priority: 'Medium',
        category: 'Work',
        dueDate: yesterday, // Intentionally overdue to showcase overdue indicator
      },
      {
        userId: user._id,
        title: 'Implement End-to-End Vitest Suites',
        description: 'Add tests for Kanban status shifts and dashboard chart data calculations.',
        status: 'In Progress',
        priority: 'High',
        category: 'Project',
        dueDate: tomorrow,
      },
      {
        userId: user._id,
        title: 'Read System Design & Distributed Caching Book',
        description: 'Complete chapters on Redis invalidation patterns and read-through caching.',
        status: 'To Do',
        priority: 'Low',
        category: 'Study',
        dueDate: inThreeDays,
      },
      {
        userId: user._id,
        title: 'Schedule Annual Health & Wellness Checkup',
        description: 'Book dental cleaning and general physical examination.',
        status: 'Completed',
        priority: 'Low',
        category: 'Personal',
        dueDate: yesterday,
        completedAt: yesterday,
      },
      {
        userId: user._id,
        title: 'Deploy Production Release to Render & Vercel',
        description: 'Configure environment variables, secure domain mapping, and test live cookies.',
        status: 'To Do',
        priority: 'High',
        category: 'Project',
        dueDate: nextWeek,
      },
    ];

    await Task.insertMany(sampleTasks);
    console.log(`[TaskFlow Seeder] Seeded ${sampleTasks.length} sample tasks successfully!`);

    await mongoose.disconnect();
    console.log('[TaskFlow Seeder] Finished and disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error(`[TaskFlow Seeder Error]: ${err.message}`);
    process.exit(1);
  }
};

seedDatabase();
