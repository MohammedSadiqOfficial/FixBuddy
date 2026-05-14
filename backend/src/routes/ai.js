import express from 'express';
import { describeImage, getHelp } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Allow AI help to be potentially accessible without heavy auth on support page, but we'll protect them here for general use.
router.post('/describe-image', protect, describeImage);
router.post('/help', protect, getHelp);

export default router;
