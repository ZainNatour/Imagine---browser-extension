import { Router } from 'express';
import { addToWishlist, removeFromWishlist, getWishlist, getAllWishlists } from '../controllers/wishlistController';
import { authGuard } from '../middleware/authMiddleware';

const router = Router();

router.get('/all', authGuard, getAllWishlists);
router.get('/', authGuard, getWishlist);
router.post('/:id', authGuard, addToWishlist);
router.delete('/:id', authGuard, removeFromWishlist);

export default router;
