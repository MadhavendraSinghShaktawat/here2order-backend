import mongoose from 'mongoose';
import { CONSTANTS } from './constants';

export const connectDatabase = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

    await mongoose.connect(uri, CONSTANTS.MONGODB.OPTIONS);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}; 