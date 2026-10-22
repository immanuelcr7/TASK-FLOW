import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`[TaskFlow Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[TaskFlow Server] REST API Base URL: http://localhost:${PORT}/api/v1`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle Graceful Termination
    process.on('SIGTERM', () => {
      console.log('[TaskFlow Server] SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('[TaskFlow Server] Process terminated.');
      });
    });
  })
  .catch((err) => {
    console.error(`[Database Initialization Error]: ${err.message}`);
    // Keep server running in development even if local DB is not currently active
    // so development endpoints can report connection errors cleanly
    const server = app.listen(PORT, () => {
      console.log(`[TaskFlow Server (DB Pending)] Running on port ${PORT}. Please ensure MongoDB is running.`);
    });
  });
