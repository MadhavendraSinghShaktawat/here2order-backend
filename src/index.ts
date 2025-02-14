import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { CONSTANTS } from './config/constants';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found-handler';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';

dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT) || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
const apiRouter = express.Router();
app.use(CONSTANTS.API.PREFIX, apiRouter);

// Mount routes
apiRouter.use('/users', userRoutes);
apiRouter.use('/auth', authRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Function to start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!, CONSTANTS.MONGODB.OPTIONS);
    console.log('Connected to MongoDB');
    
    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    }).on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.log(`Port ${port} is busy, trying ${nextPort}`);
        app.listen(nextPort);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 