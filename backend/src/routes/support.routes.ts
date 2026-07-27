import { Router } from 'express';
import { submitTicket } from '../controllers/support.controller';

const router = Router();

router.post('/ticket', submitTicket);

export default router;
