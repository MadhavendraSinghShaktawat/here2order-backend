import mongoose from 'mongoose';
import { CONSTANTS } from './constants';
import { env } from './environment';

let isConnected = false;

const setupMongooseConnection = () => {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('MongoDB disconnected');
  });

  process.on('SIGINT', async () => {
    if (isConnected) {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    }
  });
};

const connectWithRetry = async (uri: string, options: any, retries = 5, delay = 5000): Promise<void> => {
  try {
    await mongoose.connect(uri, options);
    console.log(`Connected to MongoDB in ${env.NODE_ENV} environment`);
  } catch (error) {
    if (retries === 0) {
      console.error('Failed to connect to MongoDB after multiple attempts:', error);
      throw error;
    }
    
    console.log(`Connection to MongoDB failed, retrying in ${delay/1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return connectWithRetry(uri, options, retries - 1, delay);
  }
};

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log(`Connecting to MongoDB at ${CONSTANTS.MONGODB.URI}...`);
    
    // Setup connection event handlers
    setupMongooseConnection();
    
    // Connect with retry logic
    await connectWithRetry(CONSTANTS.MONGODB.URI, CONSTANTS.MONGODB.OPTIONS);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const connectTestDB = async (): Promise<void> => {
  try {
    if (isConnected) {
      console.log('Using existing database connection');
      return;
    }

    if (!CONSTANTS.MONGODB.URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    setupMongooseConnection();

    const options = {
      dbName: 'test',
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
    };

    await mongoose.connect(CONSTANTS.MONGODB.URI, options);
  } catch (error) {
    console.error('Test database connection error:', error);
    throw error;
  }
};

export const closeTestDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database connection:', error);
    throw error;
  }
};

export const clearTestDB = async (): Promise<void> => {
  try {
    if (!isConnected) {
      throw new Error('Database not connected');
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database instance not available');
    }

    const collections = await db.collections();
    await Promise.all(
      collections.map(async (collection) => {
        try {
          await collection.deleteMany({});
        } catch (err) {
          console.error(`Error clearing collection ${collection.collectionName}:`, err);
        }
      })
    );
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
}; 