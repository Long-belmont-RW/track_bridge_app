import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { generateRoutes, assignRoute } from '../controllers/routeController.js';

const router = express.Router();

router.get('/generate', verifyAuth, generateRoutes);
router.patch('/:id/assign', verifyAuth, assignRoute);

export default router;
