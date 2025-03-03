import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env } from './environment';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Here2Order API',
      version: '1.0.0',
      description: 'API documentation for Here2Order backend',
    },
    servers: [
      {
        url: env.API_URL,
        description: `${env.NODE_ENV} server`,
      },
    ],
  },
  apis: ['./src/modules/**/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}; 