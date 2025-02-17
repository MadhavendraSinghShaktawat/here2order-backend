import { Router } from 'express';
import { QRController } from './qr.controller';

const router = Router();
const qrController = new QRController();

router.get('/scan/:code', (req, res, next) => qrController.scanQRCode(req, res, next));

export default router; 