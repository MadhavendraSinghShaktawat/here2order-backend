import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/environment';

const port = env.PORT;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server is running in ${env.NODE_ENV} mode on port ${port}`);
      console.log(`API URL: ${env.API_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 