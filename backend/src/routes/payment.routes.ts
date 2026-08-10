import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getPaymentSettings, submitPaymentProof } from '../controllers/payment.controller';

const router = Router();

// Public configuration for manual payment
router.get('/settings', getPaymentSettings);

// Submit manual payment proof
router.post('/submit-proof', authenticate, submitPaymentProof);

export default router;
