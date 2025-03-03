import { Request, Response } from 'express';
import mongoose from 'mongoose';

export class HealthController {
  /**
   * Basic health check that returns service status
   */
  public async getHealth(req: Request, res: Response): Promise<void> {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json(healthStatus);
  }

  /**
   * Detailed health check that includes database connectivity
   */
  public async getDetailedHealth(req: Request, res: Response): Promise<void> {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const healthStatus = {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: dbStatus,
          responseTime: await this.checkDatabaseResponseTime()
        }
      }
    };

    const statusCode = dbStatus === 'connected' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  }

  /**
   * Measures database response time in milliseconds
   */
  private async checkDatabaseResponseTime(): Promise<number> {
    try {
      // Check if database connection is established
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        return -1; // Database not connected
      }
      
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      return Date.now() - start;
    } catch (error) {
      return -1; // Indicates error
    }
  }
} 