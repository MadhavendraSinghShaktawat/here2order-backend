export const CONSTANTS = {
  PORT: process.env.PORT || 3000,
  API: {
    PREFIX: '/api/v1',
    TIMEOUT: 30000, // 30 seconds
  },
  CORS: {
    ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as string[],
  },
  MONGODB: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/here2order',
    OPTIONS: {
      connectTimeoutMS: 60000, // Increase timeout to 60 seconds
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      dbName: process.env.NODE_ENV === 'test' ? 'test' : 'here2order'
    } as const
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-secret-key',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 7 * 24 * 60 * 60 // 7 days in seconds
  }
} as const; 