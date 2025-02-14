import { Router } from 'express';

const router = Router();

// TODO: Implement auth routes
router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router; 