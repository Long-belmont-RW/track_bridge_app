import express from 'express';
import multer from 'multer';
import os from 'os';
import { verifyAuth } from '../middleware/auth.js';
import {
  createDelivery,
  getDriverDeliveries,
  completeDelivery,
  bulkUploadDeliveries,
  getCompanyDeliveries,
  trackDeliveryPublic
} from '../controllers/deliveryController.js';

const router = express.Router();

// Configure multer for memory storage (for proof of delivery photo)
const memoryUpload = multer({ storage: multer.memoryStorage() });

// Configure multer for disk storage (for bulk CSV uploads)
const diskUpload = multer({ dest: os.tmpdir() });

// GET /api/deliveries/track/:tracking_number - Public tracking endpoint
router.get('/track/:tracking_number', trackDeliveryPublic);

// GET /api/deliveries - Get all deliveries for the authenticated company (protected)
router.get('/', verifyAuth, getCompanyDeliveries);

// POST /api/deliveries - Create a new delivery (protected)
router.post('/', verifyAuth, createDelivery);

// POST /api/deliveries/bulk-upload - Bulk upload deliveries via CSV
router.post('/bulk-upload', verifyAuth, diskUpload.single('file'), bulkUploadDeliveries);

// GET /api/deliveries/driver - Get deliveries for the authenticated driver (protected)
router.get('/driver', verifyAuth, getDriverDeliveries);

// PATCH /api/deliveries/:id/complete - Complete a delivery with PoD (protected)
router.patch('/:id/complete', verifyAuth, memoryUpload.single('photo'), completeDelivery);

export default router;
