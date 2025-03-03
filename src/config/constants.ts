import { env } from './environment';

export const CONSTANTS = {
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  API: {
    PREFIX: '/api/v1',
    TIMEOUT: 30000, // 30 seconds
    URL: env.API_URL,
  },
  CORS: {
    ORIGINS: env.CORS_ORIGINS,
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as string[],
  },
  MONGODB: {
    URI: env.MONGODB_URI,
    OPTIONS: {
      connectTimeoutMS: 60000, // Increase timeout to 60 seconds
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      dbName: env.NODE_ENV === 'test' ? 'test' : 'here2order'
    } as const
  },
  JWT: {
    SECRET: env.JWT_SECRET,
    EXPIRES_IN: env.JWT_EXPIRES_IN
  },
  GOOGLE_CLOUD: {
    PROJECT_ID: env.GOOGLE_CLOUD_PROJECT_ID || '',
    KEY_FILE: env.GOOGLE_CLOUD_KEY_FILE || '',
    BUCKET_NAME: env.GOOGLE_CLOUD_BUCKET_NAME || ''
  },
  FRONTEND_URL: env.FRONTEND_URL
} as const; 