export const CONSTANTS = {
  API: {
    PREFIX: '/api/v1',
    TIMEOUT: 30000, // 30 seconds
  },
  CORS: {
    ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as string[],
  },
  MONGODB: {
    OPTIONS: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    }
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-secret-key',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '86400' // 1 day in seconds
  }
} as const; 