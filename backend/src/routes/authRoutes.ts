import { Router } from 'express';
import { signUp, login, logout, getProfile, updateProfile } from '../controllers/authController';
import { authGuard } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', authGuard, logout);
router.get('/profile', authGuard, getProfile);
router.put('/profile', authGuard, updateProfile);

export default router;
