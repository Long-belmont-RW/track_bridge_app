import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { generateRoutes } from '../controllers/routeController.js';

const router = express.Router();

router.get('/generate', verifyAuth, generateRoutes);

export default router;
