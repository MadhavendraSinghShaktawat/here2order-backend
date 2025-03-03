import dotenv from 'dotenv';
import path from 'path';

// Load the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production'
  : process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'railway'
      ? '.env.railway'
      : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Environment type definition
export interface Environment {
  NODE_ENV: 'development' | 'test' | 'production' | 'railway';
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
  CORS_ORIGINS: string[];
  FRONTEND_URL: string;
  API_URL: string;
  GOOGLE_CLOUD_PROJECT_ID?: string;
  GOOGLE_CLOUD_KEY_FILE?: string;
  GOOGLE_CLOUD_BUCKET_NAME?: string;
}

// Create and validate the environment configuration
export const env: Environment = {
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production' | 'railway') || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/here2order',
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret-key',
  JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN || '604800', 10), // 7 days in seconds
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:3000/api/v1',
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
  GOOGLE_CLOUD_BUCKET_NAME: process.env.GOOGLE_CLOUD_BUCKET_NAME,
};

// Validate required environment variables
const validateEnv = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  for (const variable of requiredVars) {
    if (!process.env[variable]) {
      console.warn(`Warning: Environment variable ${variable} is not set.`);
    }
  }
  
  // Additional validation for production
  if (env.NODE_ENV === 'production') {
    if (env.JWT_SECRET === 'development-secret-key') {
      console.error('Error: Using default JWT_SECRET in production environment!');
      process.exit(1);
    }
  }
};

validateEnv(); 