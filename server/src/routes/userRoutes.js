import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { validateUpdateProfile, validateChangePassword } from '../validators/authValidator.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', validateUpdateProfile, updateProfile);
router.patch('/me/password', validateChangePassword, changePassword);

export default router;
