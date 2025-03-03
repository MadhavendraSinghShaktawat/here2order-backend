import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();
const healthController = new HealthController();

// Simple health check - publicly accessible
router.get('/', (req, res) => healthController.getHealth(req, res));

// Detailed health check - can be protected if needed
router.get('/detailed', (req, res) => healthController.getDetailedHealth(req, res));

export default router; 