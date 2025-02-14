import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { CONSTANTS } from './config/constants';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found-handler';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: CONSTANTS.CORS.ORIGINS,
  methods: CONSTANTS.CORS.METHODS as string[],
  credentials: true,
}));

// Request parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API timeout
app.use((req, res, next) => {
  res.setTimeout(CONSTANTS.API.TIMEOUT, () => {
    res.status(408).json({
      status: 'error',
      message: 'Request timeout'
    });
  });
  next();
});

// Routes
const apiRouter = express.Router();
app.use(CONSTANTS.API.PREFIX, apiRouter);

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 