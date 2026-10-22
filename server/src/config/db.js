import mongoose from 'mongoose';

/**
 * Connect to MongoDB instance (local or MongoDB Atlas)
 * @param {string} [customUri] - Optional custom connection string (e.g. for testing)
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log(`[TaskFlow DB] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[TaskFlow DB Error] Failed to connect to MongoDB: ${error.message}`);
    // Only exit in production if the database cannot be connected
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Disconnect from MongoDB instance
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[TaskFlow DB] MongoDB connection closed');
  } catch (error) {
    console.error(`[TaskFlow DB Error] Disconnect error: ${error.message}`);
  }
};
