import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { inviteDriver, getMyRoutes } from '../controllers/driverController.js';

const router = express.Router();

router.post('/invite', verifyAuth, inviteDriver);
router.get('/my-routes', verifyAuth, getMyRoutes);

export default router;
