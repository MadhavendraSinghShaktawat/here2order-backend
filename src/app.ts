import express, { Express, Router } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { CONSTANTS } from './config/constants';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found-handler';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import staffRoutes from './modules/staff/staff.routes';
import restaurantRoutes from './modules/restaurant/restaurant.routes';

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

// Debug logging for route registration
console.log('\n=== API Route Registration ===');
console.log('API Prefix:', CONSTANTS.API.PREFIX);

// Mount the API router
app.use(CONSTANTS.API.PREFIX, apiRouter);

// Mount routes with debug logging
console.log('\nMounting routes:');
console.log('- /auth');
apiRouter.use('/auth', authRoutes);

console.log('- /users');
apiRouter.use('/users', userRoutes);

console.log('- /staff');
apiRouter.use('/staff', staffRoutes);

console.log('- /restaurants');
apiRouter.use('/restaurants', restaurantRoutes);

// Print all registered routes
const printRoutes = (app: Express) => {
  const routes: Array<{ method: string; path: string }> = [];

  const print = (path: string, layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .map(method => method.toUpperCase());
      
      routes.push({
        method: methods.join(','),
        path: path + layer.route.path
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach((stackItem: any) => {
        print(path + (layer.regexp.source === '^\\/?$' ? '' : layer.regexp.source.replace(/\\\//g, '/').replace(/\?(?:\/)?$/g, '')), stackItem);
      });
    }
  };

  app._router.stack.forEach((layer: any) => {
    print('', layer);
  });

  console.log('\n=== Registered Routes ===');
  routes.forEach(route => {
    console.log(`${route.method} ${route.path}`);
  });
  console.log('========================\n');
};

// Print routes after all routes are registered
printRoutes(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 