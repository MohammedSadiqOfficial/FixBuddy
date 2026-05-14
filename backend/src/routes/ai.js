import express from 'express';
import { describeImage, getHelp } from '../controllers/ai.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Allow AI help to be potentially accessible without heavy auth on support page, but we'll protect them here for general use.
router.post('/describe-image', authMiddleware(), describeImage);
router.post('/help', authMiddleware(), getHelp);

export default router;
